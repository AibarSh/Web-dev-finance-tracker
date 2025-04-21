import { Component } from '@angular/core';
import { PieChartComponent } from './pie-chart/pie-chart/pie-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart/bar-chart.component';
import { AuthService } from '../../../auth/auth.service';  
import { inject } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  private authService = inject(AuthService);
  
  username: string = ''; 
  
  constructor() {
    this.username = this.authService.getUsername(); 
  }
}
