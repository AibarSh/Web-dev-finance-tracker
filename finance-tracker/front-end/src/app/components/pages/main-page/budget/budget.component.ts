import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Goal, GoalTransaction } from '../../../../user-interfaces/user-interfaces.interface';
import { Message } from '../../../../user-interfaces/user-interfaces.interface';


@Component({
  selector: 'app-budget',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent {
  @Input() goals: Goal[] = [];
  @Output() goalsUpdated = new EventEmitter<void>();
  goalForm: FormGroup;
  transactionForm: FormGroup;
  editingGoal: Goal | null = null;
  editingTransaction: GoalTransaction | null = null;
  selectedGoalId: number | null = null;
  message: Message | null = null;
  apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.goalForm = this.fb.group({
      name: ['', Validators.required],
      target_amount: [0, [Validators.required, Validators.min(0.01)]]
    });
    this.transactionForm = this.fb.group({
      goal: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
  }

  showMessage(text: string, type: 'error' | 'success'): void {
    this.message = { text, type };
    // Auto-dismiss after 5 seconds
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage(): void {
    this.message = null;
  }

  validateTransaction(): string | null {
    if (this.transactionForm.invalid) {
      return 'Please fill in all required fields.';
    }
    const goalId = this.transactionForm.value.goal;
    const amount = this.transactionForm.value.amount;
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) {
      return 'Selected goal not found.';
    }
    const currentAmount = goal.current_amount;
    const targetAmount = goal.target_amount;
    let newAmount = currentAmount + amount;

    // Adjust for editing existing transaction
    if (this.editingTransaction) {
      newAmount = currentAmount - this.editingTransaction.amount + amount;
    }

    if (newAmount > targetAmount) {
      const maxAllowed = targetAmount - currentAmount + (this.editingTransaction?.amount || 0);
      return `Transaction would exceed goal target of $${targetAmount.toFixed(2)}. Maximum additional amount: $${maxAllowed.toFixed(2)}.`;
    }
    return null;
  }

  onSubmitGoal(): void {
    if (this.goalForm.invalid) {
      this.showMessage('Please fill in all required fields.', 'error');
      return;
    }

    const goalData = this.goalForm.value;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    const url = this.editingGoal
      ? `${this.apiUrl}/goals/${this.editingGoal.id}/`
      : `${this.apiUrl}/goals/`;
    console.log('Submitting goal to:', url, 'Data:', goalData);

    if (this.editingGoal) {
      this.http.patch(url, goalData, { headers })
        .subscribe({
          next: () => {
            if (!Array.isArray(this.goals)) {
              console.warn('goals is not an array, resetting:', this.goals);
              this.goals = [];
            }
            this.goals = this.goals.map(goal =>
              goal.id === this.editingGoal!.id ? { ...goal, ...goalData } : goal
            );
            this.goalsUpdated.emit();
            this.resetGoalForm();
            this.showMessage('Goal updated successfully!', 'success');
          },
          error: (err) => {
            console.error('Goal update failed:', err);
            const errorMsg = err.error?.detail || 'Unknown error';
            this.showMessage(`Failed to update goal: ${errorMsg}`, 'error');
          }
        });
    } else {
      this.http.post(url, goalData, { headers })
        .subscribe({
          next: (newGoal: any) => {
            console.log('Received newGoal:', newGoal);
            if (newGoal && typeof newGoal === 'object' && 'id' in newGoal) {
              if (!Array.isArray(this.goals)) {
                console.warn('goals is not an array, resetting:', this.goals);
                this.goals = [];
              }
              this.goals = [...this.goals, { ...newGoal, goal_transactions: [] }];
              this.goalsUpdated.emit();
              this.resetGoalForm();
              this.showMessage('Goal added successfully!', 'success');
            } else {
              console.error('Invalid newGoal response:', newGoal);
              this.showMessage('Failed to add goal: Invalid server response', 'error');
            }
          },
          error: (err) => {
            console.error('Goal add failed:', err);
            const errorMsg = err.error?.detail || 'Unknown error';
            this.showMessage(`Failed to add goal: ${errorMsg}`, 'error');
          }
        });
    }
  }

  onSubmitTransaction(): void {
    const error = this.validateTransaction();
    if (error) {
      this.showMessage(error, 'error');
      return;
    }

    const transactionData = {
      goal: this.transactionForm.value.goal,
      amount: this.transactionForm.value.amount,
      description: this.transactionForm.value.description
    };
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    const url = this.editingTransaction
      ? `${this.apiUrl}/goal-transactions/${this.editingTransaction.id}/`
      : `${this.apiUrl}/goal-transactions/`;
    console.log('Submitting transaction to:', url, 'Data:', transactionData);

    if (this.editingTransaction) {
      this.http.patch(url, transactionData, { headers })
        .subscribe({
          next: () => {
            this.goalsUpdated.emit();
            this.resetTransactionForm();
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
              this.goalsUpdated.emit();
              this.resetTransactionForm();
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

  editGoal(goal: Goal): void {
    this.editingGoal = goal;
    this.goalForm.patchValue({
      name: goal.name,
      target_amount: goal.target_amount
    });
  }

  editTransaction(transaction: GoalTransaction): void {
    this.editingTransaction = transaction;
    this.transactionForm.patchValue({
      goal: transaction.goal,
      amount: Math.abs(transaction.amount), // Display positive for simplicity
      description: transaction.description
    });
  }

  cancelEditGoal(): void {
    this.resetGoalForm();
  }

  cancelEditTransaction(): void {
    this.resetTransactionForm();
  }

  deleteGoal(goalId: number): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    console.log('Deleting goal:', `${this.apiUrl}/goals/${goalId}/`);
    this.http.delete(`${this.apiUrl}/goals/${goalId}/`, { headers })
      .subscribe({
        next: () => {
          if (!Array.isArray(this.goals)) {
            console.warn('goals is not an array, resetting:', this.goals);
            this.goals = [];
          }
          this.goals = this.goals.filter(goal => goal.id !== goalId);
          this.goalsUpdated.emit();
          this.showMessage('Goal deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Goal delete failed:', err);
          const errorMsg = err.error?.detail || 'Unknown error';
          this.showMessage(`Failed to delete goal: ${errorMsg}`, 'error');
        }
      });
  }

  deleteTransaction(transactionId: number): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`,
      'Content-Type': 'application/json'
    });

    console.log('Deleting transaction:', `${this.apiUrl}/goal-transactions/${transactionId}/`);
    this.http.delete(`${this.apiUrl}/goal-transactions/${transactionId}/`, { headers })
      .subscribe({
        next: () => {
          this.goalsUpdated.emit(); // Refresh to get updated current_amount
          this.showMessage('Transaction deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Transaction delete failed:', err);
          const errorMsg = err.error?.detail || 'Unknown error';
          this.showMessage(`Failed to delete transaction: ${errorMsg}`, 'error');
        }
      });
  }

  private resetGoalForm(): void {
    this.goalForm.reset({ name: '', target_amount: 0 });
    this.editingGoal = null;
  }

  private resetTransactionForm(): void {
    this.transactionForm.reset({ goal: null, amount: 0, description: '' });
    this.editingTransaction = null;
    this.selectedGoalId = null;
  }
}
