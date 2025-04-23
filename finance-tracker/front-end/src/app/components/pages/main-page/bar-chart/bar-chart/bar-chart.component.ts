import { Component, OnInit, Output,Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Transaction, Message } from '../../../../../user-interfaces/user-interfaces.interface';
import { OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @Output() transactionsUpdated = new EventEmitter<void>();
  chart: any;
  transactionForm: FormGroup;
  editingTransaction: Transaction | null = null;
  message: Message | null = null;
  apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private fb: FormBuilder
  ) {
    this.transactionForm = this.fb.group({
      date: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['E', Validators.required],
      category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] && this.transactions) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.processTransactions();

    this.chart = new Chart('MyBarChart', {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Incomes',
            data: data.incomes,
            backgroundColor: '#2ecc71',
            borderColor: '#27ae60',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: data.expenses,
            backgroundColor: '#e74c3c',
            borderColor: '#c0392b',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)',
              color: '#ffffff' // White text for y-axis title
            },
            ticks: {
              color: '#ffffff' // White text for y-axis labels
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)' // Light grid lines for contrast
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date',
              color: '#ffffff' // White text for x-axis title
            },
            ticks: {
              color: '#ffffff' // White text for x-axis labels
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)' // Light grid lines for contrast
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff' // White text for legend
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark tooltip background
            titleColor: '#ffffff', // White tooltip title
            bodyColor: '#ffffff', // White tooltip body
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: $${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  private processTransactions(): { labels: string[]; incomes: number[]; expenses: number[] } {
    if (!this.transactions || this.transactions.length === 0) {
      return { labels: [], incomes: [], expenses: [] };
    }

    const grouped: { [date: string]: { income: number; expense: number } } = {};
    this.transactions.forEach(tx => {
      const date = tx.date.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { income: 0, expense: 0 };
      }
      if (tx.type === 'I') {
        grouped[date].income += tx.amount;
      } else if (tx.type === 'E') {
        grouped[date].expense += tx.amount;
      }
    });

    const labels = Object.keys(grouped).sort();
    const incomes = labels.map(date => grouped[date].income);
    const expenses = labels.map(date => grouped[date].expense);

    return { labels, incomes, expenses };
  }

  showMessage(text: string, type: 'error' | 'success' | 'confirm'): void {
    this.message = { text, type };
    if (type !== 'confirm') {
      setTimeout(() => this.clearMessage(), 5000);
    }
  }

  clearMessage(): void {
    this.message = null;
  }

  confirmClear(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    console.log('Clearing all transactions:', `${this.apiUrl}/transactions/clear/`);
    this.http.delete(`${this.apiUrl}/transactions/clear/`, { headers })
      .subscribe({
        next: (response: any) => {
          this.transactionsUpdated.emit();
          this.showMessage(response.message || 'All transactions cleared successfully!', 'success');
        },
        error: (err) => {
          console.error('Clear transactions failed:', err);
          const errorMsg = err.error?.detail || 'Unknown error';
          this.showMessage(`Failed to clear transactions: ${errorMsg}`, 'error');
        }
      });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.showMessage('Please fill in all required fields.', 'error');
      return;
    }

    const transactionData = {
      date: this.transactionForm.value.date,
      amount: this.transactionForm.value.amount,
      type: this.transactionForm.value.type,
      category: this.transactionForm.value.category,
      description: this.transactionForm.value.description
    };
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    const url = this.editingTransaction
      ? `${this.apiUrl}/transactions/${this.editingTransaction.id}/`
      : `${this.apiUrl}/transactions/`;
    console.log('Submitting transaction to:', url, 'Data:', transactionData);

    if (this.editingTransaction) {
      this.http.patch(url, transactionData, { headers })
        .subscribe({
          next: () => {
            this.transactionsUpdated.emit();
            this.resetForm();
            this.showMessage('Transaction updated successfully!', 'success');
          },
          error: (err) => {
            console.error('Transaction update failed:', err);
            const errorMsg = err.error?.detail || 'Unknown error';
            this.showMessage(`Failed to update transaction: ${errorMsg}`, 'error');
          }
        });
    } else {
      this.http.post(url, transactionData, { headers })
        .subscribe({
          next: (newTransaction: any) => {
            console.log('Received newTransaction:', newTransaction);
            if (newTransaction && typeof newTransaction === 'object' && 'id' in newTransaction) {
              this.transactionsUpdated.emit();
              this.resetForm();
              this.showMessage('Transaction added successfully!', 'success');
            } else {
              console.error('Invalid newTransaction response:', newTransaction);
              this.showMessage('Failed to add transaction: Invalid server response', 'error');
            }
          },
          error: (err) => {
            console.error('Transaction add failed:', err);
            const errorMsg = err.error?.detail || 'Unknown error';
            this.showMessage(`Failed to add transaction: ${errorMsg}`, 'error');
          }
        });
    }
  }

  editTransaction(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.transactionForm.patchValue({
      date: transaction.date.split('T')[0],
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteTransaction(transactionId: number): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    console.log('Deleting transaction:', `${this.apiUrl}/transactions/${transactionId}/`);
    this.http.delete(`${this.apiUrl}/transactions/${transactionId}/`, { headers })
      .subscribe({
        next: () => {
          this.transactionsUpdated.emit();
          this.showMessage('Transaction deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Transaction delete failed:', err);
          const errorMsg = err.error?.detail || 'Unknown error';
          this.showMessage(`Failed to delete transaction: ${errorMsg}`, 'error');
        }
      });
  }

  clearAllTransactions(): void {
    this.showMessage('Are you sure you want to delete all transactions? This cannot be undone.', 'confirm');
  }

  private resetForm(): void {
    this.transactionForm.reset({
      date: '',
      amount: 0,
      type: 'E',
      category: '',
      description: ''
    });
    this.editingTransaction = null;
  }
}
