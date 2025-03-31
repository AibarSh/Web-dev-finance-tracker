

import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-pie-chart',
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css'
})
export class PieChartComponent {
  public pieChart: any;

  ngOnInit(): void {
    this.createChart();
  }

  createChart() {
    this.pieChart = new Chart("MyPieChart", {
      type: 'doughnut', //this denotes tha type of chart
      data: {
        labels: [
          'House',
          'Car',
          'Cash savings'
        ],
        datasets: [{
          label: 'Value',
          data: [45000, 5000, 2000],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          hoverOffset: 4,
          borderWidth: 1
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
      }
    });
  }



}
