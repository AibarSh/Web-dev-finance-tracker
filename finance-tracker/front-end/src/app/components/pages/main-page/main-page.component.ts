import { Component } from '@angular/core';
import { PieChartComponent } from './pie-chart/pie-chart/pie-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart/bar-chart.component';
import { AuthService } from '../../../auth/auth.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserData } from '../../../auth/auth.interface';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent,CommonModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})



export class MainPageComponent {
  private authService = inject(AuthService);
  userData: any = null;
  username: string = ""; // Default value

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
        this.userData = data;
        this.username = data.username; // Assuming the response contains a 'username' field
        console.log('User data:', data);
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
      }
    });
  }
}



