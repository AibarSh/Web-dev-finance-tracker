import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { OnChanges, SimpleChanges, Input } from '@angular/core';
import { NetWorth } from '../../../../../user-interfaces/user-interfaces.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-pie-chart',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css'
})
export class PieChartComponent implements OnChanges {
  @Input() netWorth: NetWorth[] = [];
  @Output() netWorthUpdated = new EventEmitter<void>();
  public pieChart: Chart | null = null;
  assetForm: FormGroup;
  editingAsset: NetWorth | null = null;
  apiUrl = 'http://127.0.0.1:8000/api'
  private isViewInitialized = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.assetForm = this.fb.group({
      name: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['netWorth']) {
      console.log('netWorth input changed:', this.netWorth);
      if (!Array.isArray(this.netWorth)) {
        console.warn('netWorth is not an array, resetting to []:', this.netWorth);
        this.netWorth = [];
      }
      if (this.isViewInitialized) {
        setTimeout(() => {
          this.createChart();
        }, 0);
      } else {
        console.log('Deferring chart creation until view is initialized');
      }
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Attempting to create chart');
    this.isViewInitialized = true;
    setTimeout(() => {
      this.createChart();
    }, 0);
  }

  createChart(): void {
    if (!Array.isArray(this.netWorth) || this.netWorth.length === 0) {
      console.log('Skipping chart creation: netWorth is empty or not an array:', this.netWorth);
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }
      return;
    }

    const canvas = document.getElementById('MyPieChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element with ID "MyPieChart" not found in DOM');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to acquire 2D context for canvas');
      return;
    }

    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }


    try {
      const labels = this.netWorth.map(asset => asset.name);
      const data = this.netWorth.map(asset => {
        const value = this.parseValue(asset.value);
        if (isNaN(value)) {
          console.warn(`Invalid asset value for ${asset.name}: ${asset.value}, using 0`);
        }
        return value;
      });
      const backgroundColors = this.generateColors(this.netWorth.length);

      this.pieChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Net Worth',
            data: data,
            backgroundColor: backgroundColors,
            hoverOffset: 4,
            borderWidth: 1
          }]
        },
        options: {
          cutout: '70%',
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed || 0;
                  return `${context.label}: $${value.toFixed(2)}`;
                }
              }
            }
          }
        }
      });
      console.log('Chart created successfully with data:', { labels, data });
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  }

  private parseValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      console.warn(`Invalid asset value: ${value}, defaulting to 0`);
      return 0;
    }
    return parsed;
  }

  private generateColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    return colors;
  }

  onSubmit(): void {
    if (this.assetForm.invalid) {
      return;
    }

    const assetData = this.assetForm.value;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`
    });

    console.log('Token:', this.cookieService.get('access_token')); // Log token
    const url = this.editingAsset
      ? `api/assets/${this.editingAsset.id}/`
      : `api/assets/`;
    console.log('Request URL:', url); // Log URL

    if (this.editingAsset) {
      // Update existing asset
      this.http.patch(`${this.apiUrl}/assets/${this.editingAsset.id}/`, assetData, { headers })
        .subscribe({
          next: () => {
            this.netWorth = this.netWorth.map(asset =>
              asset.id === this.editingAsset!.id ? { ...asset, ...assetData } : asset
            );
            this.createChart();
            this.netWorthUpdated.emit();
            this.resetForm();
          },
          error: (err) => {
            console.error('Update failed', err)
            console.log("response", err.error);
            alert('Failed to update asset. Please try again.');
          }
        });
    } else {
      // Add new asset
      this.http.post(`${this.apiUrl}/assets/`, assetData, { headers })
        .subscribe({
          next: (newAsset: any) => {
            this.netWorth = [...this.netWorth, newAsset];
            this.createChart();
            this.netWorthUpdated.emit();
            this.resetForm();
          },
          error: (err) => {
            console.error('Add failed', err)
            console.log("response", err.error);
            alert('Failed to add asset. Please try again.');
          }

        });
    }
  }

  editAsset(asset: NetWorth): void {
    this.editingAsset = asset;
    this.assetForm.patchValue({
      name: asset.name,
      value: asset.value
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteAsset(assetId: number): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.cookieService.get('access_token')}`
    });

    this.http.delete(`${this.apiUrl}/assets/${assetId}/`, { headers })
      .subscribe({
        next: () => {
          this.netWorth = this.netWorth.filter(asset => asset.id !== assetId);
          this.createChart();
          this.netWorthUpdated.emit();
        },
        error: (err) => console.error('Delete failed', err)
      });
  }

  private resetForm(): void {
    this.assetForm.reset({ name: '', value: 0 });
    this.editingAsset = null;
  }
}
