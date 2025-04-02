import { Component } from '@angular/core';
import { PieChartComponent } from './pie-chart/pie-chart/pie-chart.component';  // Правильный путь
import { BarChartComponent } from './bar-chart/bar-chart/bar-chart.component';  // Пример импорта другого компонента

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent],  // Добавляем компоненты в imports
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {}
