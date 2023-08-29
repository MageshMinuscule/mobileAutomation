import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { ServiceProvider } from 'src/providers/service/service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit{
  @ViewChild('requestCountBarChart') private requestCountBarChart: ElementRef;
  @ViewChild('reqWorkflowChart') private reqWorkflowChart: ElementRef;
  @ViewChild('prevWorkflowChart') private prevWorkflowChart: ElementRef;
  @ViewChild('reqAssetChart') private reqAssetBar: ElementRef;
  @ViewChild('prevAssetBar') private prevAssetBar: ElementRef;
  @ViewChild('reqLocBar') private reqLocBar: ElementRef;
  @ViewChild('prevLocBar') private prevLocBar: ElementRef;
  @ViewChild('canvas') private canvas: ElementRef;

  barChart: any;
  reqBarChart: any;
  workFlowChart: any;
  lineChart: any;
  plugin: { id: string; beforeDraw: (chart: any) => void };
  logoSrc: any;
  isBarChartMethod: boolean;
  topLocation: any = [];
  locationClosedCount: any[];
  topWorkflow: any = [];
  workflowClosedCount: any[];
  requestCount: any;
  bars: Chart<"bar", number[], string>;
  top10LocationData: any;
  viewType: any;
  workFlowSummary: any;
  locationsummary: any;
  chart: Chart<"doughnut", number[], string>;
  topAsset: any = [];
  firstDate: string;
  currenDate: string;
  assetSummmary: any;
  assetBarChart: any;

  constructor(private router: Router, private reqService: ServiceProvider) {}

  ngOnInit() {
    this.firstDate = this.formatStartDate(new Date());
    console.log("firstDate: "+this.firstDate);
    this.currenDate = this.formatDate(new Date());
    console.log("currentDtae :"+this.currenDate);
  }
  ionViewWillEnter() {
    this.viewType = 'WorkOrder'
    var filters: string =
    '{"requestType" : ' +
    'WORK_REQUEST'+
    ', "fromDate" : ' +
    JSON.stringify(this.firstDate) +
    ', "toDate" : ' +
    JSON.stringify(this.currenDate) +
    '}';
    this.getWorkFlowSummary(filters);
    this.getLocationSummary(filters);
    this.getAssetSummary(filters);
    this.getCount();
    // this.half();
  }
  // half() {
  //   this.chart = new Chart(this.canvas.nativeElement,{
  //     type: 'doughnut',
  //     data: {
  //       labels: ['AVG Time Taken Close WorkOrders'],
  //       datasets: [
  //         { 
  //           data: [50],
  //           borderWidth:40,
  //           borderRadius:5,
  //           hoverBorderWidth:30,
  //           offset: 40,
  //           backgroundColor: ['rgba(255, 0, 0, 1)','rgba(255, 0, 0, 0.1)'],
  //         },
  //       ]
  //     },
  //     options: {
  //      rotation: 270,
  //       circumference: 180,
  //       plugins:{
  //         tooltip: {
  //           enabled: false
  //         },
  //         legend:{
  //           display: false
  //         }
  //       }
  //     }
  //   });
  // }
  ngAfterViewInit() {
  }
  segmentChanged(ev) {
    this.viewType = ev.target.value;

    if(this.viewType == 'WorkOrder') {
      var filters: string =
      '{"requestType" : ' +
      'WORK_REQUEST'+
      ', "fromDate" : ' +
      JSON.stringify(this.firstDate) +
      ', "toDate" : ' +
      JSON.stringify(this.currenDate) +
      '}';
    } else {
      var filters: string =
      '{"requestType" : ' +
      'SCHEDULE_REQUEST'+
      ', "fromDate" : ' +
      JSON.stringify(this.firstDate) +
      ', "toDate" : ' +
      JSON.stringify(this.currenDate) +
      '}';
    }
    this.barChart = null;
    this.bars =  null;
    this.load(filters);
  }
  load(filter) {
    this.getWorkFlowSummary(filter);
    this.getLocationSummary(filter);
    this.getAssetSummary(filter)
    this.getCount();
  }
  getCount() {
    let options = {
      category: undefined,
      categoryId: undefined,
      company: undefined,
      companyId: undefined,
      dateFilter: undefined,
      dateRangeType: 'month',
      fromDate: '2022-05-01',
      groupBy: undefined,
      holdById: undefined,
      holdByName: undefined,
      location: undefined,
      locationId: undefined,
      overallName: undefined,
      raisedBy: undefined,
      raisedById: undefined,
      raisedByName: undefined,
      requestType: 'ALL',
      sectionDetail: undefined,
      state: undefined,
      stateId: undefined,
      status: undefined,
      submittedBy: undefined,
      toDate: '2022-05-31',
      user: undefined,
      userId: undefined,
      usergroup: undefined,
      usergroupId: undefined,
      workflow: undefined,
      workflowId: undefined,
    };
    this.reqService.getRequestCount(options).subscribe((res) => {
      console.log(res);
      this.requestCount = res;

      this.barChartRequestCount(this.requestCount);
    });
  }
  getLocationSummary(filter) {
    this.topLocation = [];
    var obj= {
    }
    this.reqService.locationsummary(filter).subscribe(
      (res) => {
        this.locationsummary = res;
        let i = 0;
        let j= 0;
        for(i = 0; i <= 10; i++) {
          for(j = i; j<= i; j++) {
             obj = {
              label : res.name[i],
              data : res.closedCount[j]
            }
          }
          this.topLocation.push(obj);
        }
        this.topLocation.sort((a,b)=> b.data - a.data);
        this.viewType == 'WorkOrder' ? this.reqLocbarChart(this.topLocation) : this.prevLocbarChart(this.topLocation);
      },
      async (err) => {
        console.log('Unable to get a location summary data: ' + err);
      }
    );
  }
  getAssetSummary(filter) {
    this.topAsset = [];
    var obj = {};
    this.reqService.assetSummary(filter).subscribe(
      (res)=>{
        this.assetSummmary = res;
        let i = 0;
        let j= 0;
        for(i = 0; i <= 10; i++) {
          for(j = i; j<= i; j++) {
             obj = {
              label : res.name[i],
              data : res.closedCount[j]
            }
          }
          this.topAsset.push(obj);
        }
        this.topAsset.sort((a,b)=> b.data - a.data);
        this.viewType == 'WorkOrder' ? this.reqAssetChart(this.topAsset) : this.prevAssetChart(this.topAsset);
      }
    )

  }
  getWorkFlowSummary(filter) {
    this.topWorkflow = [];
    var obj ={};
    this.reqService.workFlowSummary(filter).subscribe(
      (res) => {
        this.workFlowSummary = res;
        let i = 0;
        let j= 0;
        for(i = 0; i <= 10; i++) {
          for(j = i; j<= i; j++) {
             obj = {
              label : res.name[i],
              data : res.closedCount[j]
            }
          }
          this.topWorkflow.push(obj);
        }
        this.topWorkflow.sort((a,b)=> b.data - a.data);
        this.viewType == 'WorkOrder' ? this.reqWorkFlowChartMethod(this.topWorkflow) : this.prevWorkFlowChartMethod(this.topWorkflow);
      },
      async (err) => {
        console.log('Unable to get a workflow summary data: ' + err);
      }
    );
  }
  reqAssetChart(asset) {
    let data= [];
    let label = [];
    asset.forEach(ele =>{
      data.push(ele.data);
      label.push(ele.label);
    })
    console.log(data+ " "+ label)
    this.assetBarChart = new Chart(this.reqAssetBar.nativeElement, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [
          {
            label: 'Top Locations',
            data: data,
            barPercentage: 1.5,
            borderWidth: 10,
            borderRadius: 10,
            borderSkipped: 'start',
            pointStyle: 'circle',
            backgroundColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
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
  prevAssetChart(asset) {
    let data= [];
    let label = [];
    asset.forEach(ele =>{
      data.push(ele.data);
      label.push(ele.label);
    })
    console.log(data+ " "+ label)
    this.assetBarChart = new Chart(this.prevAssetBar.nativeElement, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [
          {
            label: 'Top Locations',
            data: data,
            barPercentage: 1.5,
            borderWidth: 10,
            borderRadius: 10,
            borderSkipped: 'start',
            pointStyle: 'circle',
            backgroundColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
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
  reqLocbarChart(loc) {
    let data= [];
    let label = [];
    loc.forEach(ele =>{
      data.push(ele.data);
      label.push(ele.label);
    })
    console.log(data+ " "+ label)
    this.barChart = new Chart(this.reqLocBar.nativeElement, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [
          {
            label: 'Top Locations',
            data: data,
            barPercentage: 1.5,
            borderWidth: 10,
            borderRadius: 10,
            borderSkipped: 'start',
            pointStyle: 'circle',
            backgroundColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
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
  prevLocbarChart(loc) {
    let data= [];
    let label = [];
    loc.forEach(ele =>{
      data.push(ele.data);
      label.push(ele.label);
    })
    console.log(data+ " "+ label)
    this.barChart = new Chart(this.prevLocBar.nativeElement, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [
          {
            label: 'Top Locations',
            data: data,
            barPercentage: 1.5,
            borderWidth: 10,
            borderRadius: 10,
            borderSkipped: 'start',
            pointStyle: 'circle',
            backgroundColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
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
  reqWorkFlowChartMethod(workflow) {
    let data= [];
    let label = [];
    workflow.forEach(ele =>{
      data.push(ele.data);
      label.push(ele.label);
    })
    console.log(data+ " "+ label)
    this.bars = new Chart(this.reqWorkflowChart.nativeElement, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [{
          label: 'Closed Workflow',
          data: data,
          backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        plugins:{
          legend: {
            display: false,
            labels:{
              font:{
                size:8
              }
            }
          }
        },
        scales: {
        }
      }
    });
  }
  prevWorkFlowChartMethod(workflow) {
    let data= [];
    let label = [];
    workflow.forEach(ele =>{
      data.push(ele.data);
      label.push(ele.label);
    })
    console.log(data+ " "+ label)
    this.bars = new Chart(this.prevWorkflowChart.nativeElement, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [{
          label: 'Closed Workflow',
          data: data,
          backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        plugins:{
          legend: {
            display: false,
            labels:{
              font:{
                size:8
              }
            }
          }
        },
        scales: {
        }
      }
    });
  }
  barChartRequestCount(count) {
    this.reqBarChart = new Chart(this.requestCountBarChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['pending', 'Closed', 'Rejected', 'SLA Breached', 'WIP'],
        datasets: [
          {
            label: 'WorkOrder Count',
            data: [
              count.pending,
              count.closed,
              count.rejected,
              count.slaBreached,
              count.wip,
            ],
            borderWidth: 5,
            borderRadius: 5,
            backgroundColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
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
  back() {
    this.router.navigate(['settings']);
  }

  formatDate(date) {
    return [
      this.padTo2Digits(date.getDate()),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('-');
  }
  formatStartDate(date) {
    return [
      this.padTo2Digits(1),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('-');
  }
  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  } 
  
}
