import { Component } from '@angular/core';
import { PieChartComponent } from './pie-chart/pie-chart/pie-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart/bar-chart.component';
import { AuthService } from '../../../auth/auth.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFinanceData, NetWorth, Goal,GoalTransaction,Transaction} from '../../../user-interfaces/user-interfaces.interface';
import { BudgetComponent } from "./budget/budget.component";
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent, CommonModule, BudgetComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})



export class MainPageComponent {
  private authService = inject(AuthService);
  userData: UserFinanceData | null = null;
  username: string = ""; // Default value
  totalNetWorth: number = 0;
  message: { text: string; type: 'success' | 'error' } | null = null;
  private logoutSubscription: Subscription | null = null;

  ngOnInit() {
    this.logoutSubscription = this.authService.logoutMessage.subscribe(message => {
      this.showMessage(message.text, message.type);
    });
    // Wait for token availability before making the request
    if (this.authService.isAuthenticated()) {
      // Delay fetching user data to ensure token is available
      this.fetchUserData();

    } else {
      console.log('No token available yet');
    }
  }

  ngOnDestroy(): void {
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
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
            value: this.parseValue(asset.value)
          })) : [],
          goals: Array.isArray(data.goals) ? data.goals.map(goal => ({
            ...goal,
            target_amount: this.parseValue(goal.target_amount),
            current_amount: this.parseValue(goal.current_amount),
            goal_transactions: Array.isArray(goal.goal_transactions) ? goal.goal_transactions.map(tx => ({
              ...tx,
              amount: this.parseValue(tx.amount)
            })) : []
          })) : [],
          transactions: Array.isArray(data.transactions)
          ? data.transactions.map((tx: any) => ({
              id: tx.id,
              date: tx.date,
              amount: this.parseValue(tx.amount),
              type: tx.type,
              category: tx.category,
              description: tx.description
            }))
          : []
        };
        this.username = data.username;
        this.calculateTotalNetWorth();
        console.log('Processed userData.assets:', this.userData.assets);
        console.log('Processed userData.goals:', this.userData.goals);
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

  logout(): void {
    this.authService.logout();
  }


  showMessage(text: string, type: 'success' | 'error'): void {
    this.message = { text, type };
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage(): void {
    this.message = null;
  }

  refreshNetWorth(): void {
    this.fetchUserData();
  }

  refreshUserData(): void {
    this.fetchUserData();
  }
  handleDataUpdated(): void {
    this.fetchUserData();
  }
}



