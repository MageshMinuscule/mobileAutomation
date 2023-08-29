import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-my-activity',
  templateUrl: './my-activity.page.html',
  styleUrls: ['./my-activity.page.scss'],
})
export class MyActivityPage implements OnInit {
  @ViewChild('LineChart') private LineChart: ElementRef;
  @ViewChild('barChart') private barChart: ElementRef;
  chart: any;
  bar: any;
  cutOutSize: number;
  line: Chart<"line", number[], string>;
  constructor(
    private router:Router
  ) { 
    
  }
  ngAfterViewInit() {
    this.lineChart();
    this.barChartView();
  }
  barChartView() {
    this.cutOutSize = 40;
    this.chart = new Chart(this.barChart.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: 'WorkOrder Count',
            data:[
              40,60
            ],
            backgroundColor: [
              '#A0BDE7',
              '#3C75C6',
            ],
            borderColor: [
              '#A0BDE7',
              '#3C75C6',
            ],
          },
        ],
      },
      options: {
        cutout: this.cutOutSize,
        plugins: {
          legend: {
            display: false,
          },
        },
        animations: {
          tension: {
            duration: 1000,
            easing: 'easeOutCirc',
            from: 1,
            to: 0,
            loop: true,
          },
        },
      },
    });
  }

  ngOnInit() {
    
    const data = {
      labels: 'Line Chart',
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }
  lineChart() {
    // 58BE47
    // 100%
    // #D9D9D9
    // 0%
    // #3C75C6
    // 40%  
    let color = 'linear-gradient(180deg, #58BE47 44.13%, rgba(217, 217, 217, 0) 116.87%, rgba(60, 117, 198, 0.4) 116.87%)';
    this.line = new Chart(this.LineChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun','Jul','Aug','Sep','Oct'],
        datasets: [
          {
            // label: 'My First Dataset',
            data: [65, 20, 80, 16, 56, 55, 40,79, 89,44,22,68],
            tension:0.4,
            borderWidth: 5,
            backgroundColor: [
              '#127701'
            ],
            borderColor: '#127701',
            pointStyle: 'false' ,
            fill:true,
            // fillColor:
            // fillColor : 'linear-gradient(180deg, #58BE47 44.13%, rgba(217, 217, 217, 0) 116.87%, rgba(60, 117, 198, 0.4) 116.87%)',
          },
        ],
      },
      options: {
        elements: {
          point:{
              radius: 0
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
  back() {
    this.router.navigate(['home'])
  }
}
