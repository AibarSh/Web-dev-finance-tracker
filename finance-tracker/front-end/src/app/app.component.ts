import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './components/bar-chart/bar-chart/bar-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart/pie-chart.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,BarChartComponent,PieChartComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
