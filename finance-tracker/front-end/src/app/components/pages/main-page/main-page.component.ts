import { Component } from '@angular/core';
import { PieChartComponent } from './pie-chart/pie-chart/pie-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart/bar-chart.component';
import { AuthService } from '../../../auth/auth.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFinanceData, NetWorth, Goal, GoalTransaction,Transaction} from '../../../user-interfaces/user-interfaces.interface';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent,CommonModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})



export class MainPageComponent {
  private authService = inject(AuthService);
  userData: UserFinanceData | null = null;
  username: string = ""; // Default value
  totalNetWorth: number = 0;

  ngOnInit() {
    // Wait for token availability before making the request
    if (this.authService.isAuthenticated()) {
      // Delay fetching user data to ensure token is available
      this.fetchUserData();
    } else {
      console.log('No token available yet');
    }
  }

  fetchUserData() {
    this.authService.getUserData().subscribe({
      next: (data) => {
        console.log('Fetched user data:', JSON.stringify(data, null, 2));
        this.userData = {
          ...data,
          assets: Array.isArray(data.assets) ? data.assets.map(asset => ({
            ...asset,
            value: this.parseValue(asset.value) // Parse value to number
          })) : []
        };
        this.username = data.username;
        this.calculateTotalNetWorth();
        console.log('Processed userData.assets:', this.userData.assets);
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
        this.userData = {
          id: 0,
          username: '',
          email: '',
          assets: [],
          transactions: [],
          goals: []
        };
        this.calculateTotalNetWorth();
      }
    });
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

  private calculateTotalNetWorth(): void {
    if (this.userData?.assets && this.userData.assets.length > 0) {
      this.totalNetWorth = this.userData.assets.reduce((sum: number, asset: NetWorth) => sum + asset.value, 0);
    } else {
      this.totalNetWorth = 0;
    }
  }

  refreshNetWorth(): void {
    this.fetchUserData();
  }
}



