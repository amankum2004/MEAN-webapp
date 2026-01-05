import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { ApiService } from 'src/app/services/user.service';

@Component({
  selector: 'app-hobbies-graphs',
  template: `
    <div class="card">
      <div class="card-header">
        <h4>Hobbies Analytics Dashboard</h4>
      </div>
      <div class="card-body">
        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading chart data...</p>
        </div>

        <!-- Main Content -->
        <div *ngIf="!loading && hobbyData.length > 0">
          <!-- Statistics Cards -->
          <div class="row mb-4">
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card text-white bg-primary h-100">
                <div class="card-body text-center">
                  <h6 class="card-title">Total Users</h6>
                  <h2 class="card-text">{{ totalUsers }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card text-white bg-success h-100">
                <div class="card-body text-center">
                  <h6 class="card-title">Unique Hobbies</h6>
                  <h2 class="card-text">{{ hobbyData.length }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card text-white bg-info h-100">
                <div class="card-body text-center">
                  <h6 class="card-title">Most Popular</h6>
                  <h3 class="card-text" style="font-size: 1.5rem;">{{ mostPopularHobby }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card text-white bg-warning h-100">
                <div class="card-body text-center">
                  <h6 class="card-title">Avg per Hobby</h6>
                  <h2 class="card-text">{{ avgUsersPerHobby | number:'1.1-1' }}</h2>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts -->
          <div class="row">
            <div class="col-md-8 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5>Hobby Distribution (Bar Chart)</h5>
                </div>
                <div class="card-body">
                  <div style="height: 400px;">
                    <canvas id="barChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5>Hobby Distribution (Pie Chart)</h5>
                </div>
                <div class="card-body">
                  <div style="height: 400px;">
                    <canvas id="pieChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div class="card mt-4">
            <div class="card-header">
              <h5>Detailed Statistics</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Hobby</th>
                      <th>Users</th>
                      <th>Percentage</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of hobbyData">
                      <td><strong>{{ item.hobby }}</strong></td>
                      <td>{{ item.user_count }}</td>
                      <td>{{ (item.user_count / totalUsers * 100).toFixed(1) }}%</td>
                      <td>
                        <div class="progress" style="height: 20px;">
                          <div class="progress-bar" 
                               [style.width.%]="(item.user_count / maxValue * 100)"
                               [style.backgroundColor]="getColor(item.user_count)">
                            <span class="progress-text">{{ item.user_count }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div *ngIf="!loading && hobbyData.length === 0" class="text-center py-5">
          <div class="alert alert-warning">
            <h5>No Data Available</h5>
            <p>No hobby data found. Please register some users first.</p>
            <button class="btn btn-primary" (click)="loadHobbyData()">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .progress {
      background-color: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-bar {
      border-radius: 10px;
      transition: width 0.6s ease;
    }
    .progress-text {
      font-size: 11px;
      font-weight: bold;
      color: white;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
    }
    canvas {
      max-width: 100%;
    }
  `]
})
export class HobbiesGraphsComponent implements OnInit {
  hobbyData: any[] = [];
  loading: boolean = false;
  totalUsers: number = 0;
  mostPopularHobby: string = '';
  avgUsersPerHobby: number = 0;
  maxValue: number = 0;

    constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadHobbyData();
  }

  loadHobbyData() {
    this.loading = true;
     this.apiService.getHobbyAnalytics().subscribe({
      next: (data: any) => {
        this.hobbyData = data;
        this.calculateStats();
        this.loading = false;
        
        // Create charts after DOM updates
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading hobby data:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    if (this.hobbyData.length > 0) {
      this.totalUsers = this.hobbyData.reduce((sum, item) => sum + item.user_count, 0);
      this.maxValue = Math.max(...this.hobbyData.map(item => item.user_count));
      
      // Find most popular hobby
      const mostPopular = this.hobbyData.reduce((prev, current) => 
        prev.user_count > current.user_count ? prev : current
      );
      this.mostPopularHobby = mostPopular.hobby;
      
      this.avgUsersPerHobby = this.totalUsers / this.hobbyData.length;
    }
  }

  createCharts() {
    if (this.hobbyData.length === 0) return;

    const labels = this.hobbyData.map(item => item.hobby);
    const data = this.hobbyData.map(item => item.user_count);
    const colors = this.generateColors(this.hobbyData.length);

    // Bar Chart
    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (barCanvas) {
      const barCtx = barCanvas.getContext('2d');
      if (barCtx) {
        new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Number of Users',
              data: data,
              backgroundColor: colors,
              borderColor: colors.map(c => c.replace('0.7', '1')),
              borderWidth: 1,
              borderRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    const percentage = ((value / this.totalUsers) * 100).toFixed(1);
                    return `${value} users (${percentage}%)`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      }
    }

    // Pie Chart
    const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (pieCanvas) {
      const pieCtx = pieCanvas.getContext('2d');
      if (pieCtx) {
        new Chart(pieCtx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
      }
    }
  }

  generateColors(count: number): string[] {
    const colors = [];
    const baseColors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#343a40'
    ];
    
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  }

  getColor(value: number): string {
    const percentage = (value / this.maxValue) * 100;
    
    if (percentage > 80) return '#28a745';    // Green
    if (percentage > 60) return '#17a2b8';    // Cyan
    if (percentage > 40) return '#007bff';    // Blue
    if (percentage > 20) return '#ffc107';    // Yellow
    return '#dc3545';                         // Red
  }

  refreshData() {
    this.loadHobbyData();
  }
}




// import { Component, OnInit, ViewChild } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { 
//   ChartComponent, 
//   ColumnSeries, 
//   Category, 
//   DataLabel, 
//   Tooltip,
//   Legend,
//   LineSeries,
//   PieSeries,
//   AccumulationChartComponent,
//   AccumulationLegend,
//   AccumulationTooltip,
//   AccumulationDataLabel,
//   ILoadedEventArgs,
//   ChartTheme
// } from '@syncfusion/ej2-angular-charts';

// @Component({
//   selector: 'app-hobbies-graphs',
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <h4>Hobbies Analytics Dashboard</h4>
//       </div>
//       <div class="card-body">
//         <div *ngIf="loading" class="text-center">
//           <div class="spinner-border text-primary" role="status">
//             <span class="visually-hidden">Loading...</span>
//           </div>
//         </div>
        
//         <div *ngIf="!loading">
//           <!-- Chart Controls -->
//           <div class="row mb-4">
//             <div class="col-md-4">
//               <label class="form-label">Chart Type</label>
//               <ejs-dropdownlist 
//                 [dataSource]="chartTypes" 
//                 [(value)]="selectedChartType"
//                 (change)="onChartTypeChange($event)"
//                 placeholder="Select chart type">
//               </ejs-dropdownlist>
//             </div>
//             <div class="col-md-4">
//               <label class="form-label">Date Range</label>
//               <ejs-daterangepicker 
//                 placeholder="Select date range"
//                 (change)="onDateRangeChange($event)">
//               </ejs-daterangepicker>
//             </div>
//             <div class="col-md-4">
//               <button ejs-button (click)="refreshData()" class="mt-4">
//                 Refresh Data
//               </button>
//             </div>
//           </div>

//           <!-- Main Chart -->
//           <div class="row mb-4">
//             <div class="col-md-12">
//               <div class="card">
//                 <div class="card-header">
//                   <h5>Hobby Distribution</h5>
//                 </div>
//                 <div class="card-body">
//                   <ejs-chart #chart style='display:block;' 
//                     [title]='chartTitle'
//                     [primaryXAxis]='primaryXAxis'
//                     [primaryYAxis]='primaryYAxis'
//                     [tooltip]='tooltip'
//                     [legendSettings]='legendSettings'>
//                     <e-series-collection>
//                       <e-series 
//                         [dataSource]='hobbyData' 
//                         type='Column' 
//                         xName='hobby' 
//                         yName='user_count' 
//                         name='Users'
//                         [marker]='marker'>
//                       </e-series>
//                     </e-series-collection>
//                   </ejs-chart>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Multiple Charts Row -->
//           <div class="row">
//             <!-- Pie Chart -->
//             <div class="col-md-6">
//               <div class="card">
//                 <div class="card-header">
//                   <h5>Hobby Distribution (Pie)</h5>
//                 </div>
//                 <div class="card-body">
//                   <ejs-accumulationchart #pieChart 
//                     [title]='pieChartTitle'
//                     [legendSettings]='pieLegendSettings'
//                     [tooltip]='pieTooltip'>
//                     <e-accumulation-series-collection>
//                       <e-accumulation-series 
//                         [dataSource]='hobbyData'
//                         xName='hobby' 
//                         yName='user_count'
//                         type='Pie'
//                         [dataLabel]='pieDataLabel'>
//                       </e-accumulation-series>
//                     </e-accumulation-series-collection>
//                   </ejs-accumulationchart>
//                 </div>
//               </div>
//             </div>

//             <!-- Line Chart -->
//             <div class="col-md-6">
//               <div class="card">
//                 <div class="card-header">
//                   <h5>Trend Analysis</h5>
//                 </div>
//                 <div class="card-body">
//                   <ejs-chart #lineChart style='display:block;'
//                     [primaryXAxis]='lineXAxis'
//                     [primaryYAxis]='lineYAxis'
//                     [tooltip]='lineTooltip'>
//                     <e-series-collection>
//                       <e-series 
//                         [dataSource]='hobbyData' 
//                         type='Line' 
//                         xName='hobby' 
//                         yName='user_count' 
//                         name='User Count'
//                         [marker]='lineMarker'>
//                       </e-series>
//                     </e-series-collection>
//                   </ejs-chart>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Additional Statistics Row -->
//           <div class="row mt-4">
//             <div class="col-md-4">
//               <div class="card text-white bg-primary">
//                 <div class="card-body">
//                   <h5 class="card-title">Total Hobbies</h5>
//                   <h2 class="card-text">{{ totalHobbies }}</h2>
//                 </div>
//               </div>
//             </div>
//             <div class="col-md-4">
//               <div class="card text-white bg-success">
//                 <div class="card-body">
//                   <h5 class="card-title">Unique Hobbies</h5>
//                   <h2 class="card-text">{{ uniqueHobbies }}</h2>
//                 </div>
//               </div>
//             </div>
//             <div class="col-md-4">
//               <div class="card text-white bg-info">
//                 <div class="card-body">
//                   <h5 class="card-title">Avg Users per Hobby</h5>
//                   <h2 class="card-text">{{ avgUsersPerHobby | number:'1.1-1' }}</h2>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Data Table -->
//           <div class="mt-4">
//             <h5>Hobby Statistics</h5>
//             <ejs-grid [dataSource]='hobbyData' [allowPaging]='true' [pageSettings]='pageSettings'>
//               <e-columns>
//                 <e-column field='hobby' headerText='Hobby' width='150'></e-column>
//                 <e-column field='user_count' headerText='Number of Users' width='120'></e-column>
//                 <e-column field='percentage' headerText='Percentage' width='120' format='P2'></e-column>
//               </e-columns>
//             </ejs-grid>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .card {
//       margin-bottom: 20px;
//     }
//     ejs-chart, ejs-accumulationchart {
//       display: block;
//       height: 350px;
//     }
//     .stat-card {
//       text-align: center;
//       padding: 20px;
//     }
//   `]
// })
// export class HobbiesGraphsComponent implements OnInit {
//   @ViewChild('chart') chart!: ChartComponent;
//   @ViewChild('pieChart') pieChart!: AccumulationChartComponent;
//   @ViewChild('lineChart') lineChart!: ChartComponent;

//   hobbyData: any[] = [];
//   loading: boolean = false;
//   totalHobbies: number = 0;
//   uniqueHobbies: number = 0;
//   avgUsersPerHobby: number = 0;

//   // Chart Types for dropdown
//   chartTypes: string[] = ['Column', 'Bar', 'Line', 'Area', 'Scatter'];
//   selectedChartType: string = 'Column';

//   // Column Chart Configuration
//   public chartTitle: string = 'Hobby Distribution';
//   public primaryXAxis: Object = {
//     valueType: 'Category',
//     title: 'Hobbies',
//     labelRotation: -45
//   };
//   public primaryYAxis: Object = {
//     minimum: 0,
//     title: 'Number of Users'
//   };
//   public tooltip: Object = {
//     enable: true,
//     format: '${point.x}: <b>${point.y} users</b>'
//   };
//   public legendSettings: Object = {
//     visible: true
//   };
//   public marker: Object = {
//     dataLabel: {
//       visible: true,
//       position: 'Top'
//     }
//   };

//   // Pie Chart Configuration
//   public pieChartTitle: string = 'Hobby Distribution';
//   public pieLegendSettings: Object = {
//     visible: true,
//     position: 'Right'
//   };
//   public pieTooltip: Object = {
//     enable: true,
//     format: '${point.x}: <b>${point.y} (${point.percentage}%)</b>'
//   };
//   public pieDataLabel: Object = {
//     visible: true,
//     position: 'Inside',
//     name: 'text',
//     font: {
//       fontWeight: '600'
//     }
//   };

//   // Line Chart Configuration
//   public lineXAxis: Object = {
//     valueType: 'Category',
//     title: 'Hobbies'
//   };
//   public lineYAxis: Object = {
//     title: 'Number of Users'
//   };
//   public lineTooltip: Object = {
//     enable: true
//   };
//   public lineMarker: Object = {
//     visible: true,
//     height: 10,
//     width: 10
//   };

//   // Grid Configuration
//   public pageSettings: Object = {
//     pageSize: 5
//   };

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.loadHobbyData();
//   }

//   loadHobbyData() {
//     this.loading = true;
//     this.http.get('/api/users/analytics/hobbies').subscribe({
//       next: (data: any) => {
//         this.hobbyData = this.processChartData(data);
//         this.calculateStatistics();
//         this.loading = false;
        
//         // Refresh charts
//         if (this.chart) {
//           this.chart.refresh();
//         }
//         if (this.pieChart) {
//           this.pieChart.refresh();
//         }
//         if (this.lineChart) {
//           this.lineChart.refresh();
//         }
//       },
//       error: (error) => {
//         console.error('Error loading hobby data:', error);
//         this.loading = false;
//       }
//     });
//   }

//   processChartData(data: any[]): any[] {
//     const totalUsers = data.reduce((sum, item) => sum + item.user_count, 0);
    
//     return data.map(item => ({
//       ...item,
//       percentage: totalUsers > 0 ? item.user_count / totalUsers : 0
//     }));
//   }

//   calculateStatistics() {
//     this.totalHobbies = this.hobbyData.reduce((sum, item) => sum + item.user_count, 0);
//     this.uniqueHobbies = this.hobbyData.length;
//     this.avgUsersPerHobby = this.totalHobbies > 0 ? this.totalHobbies / this.uniqueHobbies : 0;
//   }

//   onChartTypeChange(event: any) {
//     if (this.chart && event.value) {
//       // Change chart type dynamically
//       this.chart.series[0].type = event.value;
//       this.chart.refresh();
//     }
//   }

//   onDateRangeChange(event: any) {
//     // Handle date range filtering
//     console.log('Date range changed:', event.value);
//     // You can implement filtering logic here
//   }

//   refreshData() {
//     this.loadHobbyData();
//   }
// }




// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Chart, registerables } from 'chart.js';

// @Component({
//   selector: 'app-hobbies-graphs',
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <h4>Hobbies Analytics</h4>
//       </div>
//       <div class="card-body">
//         <div *ngIf="loading" class="text-center">
//           <div class="spinner-border text-primary" role="status">
//             <span class="visually-hidden">Loading...</span>
//           </div>
//         </div>
        
//         <div *ngIf="!loading">
//           <div *ngIf="hobbyData.length > 0">
//             <h5>Hobby Distribution</h5>
//             <div class="chart-container" style="height: 400px; width: 100%;">
//               <canvas #hobbyChart></canvas>
//             </div>
            
//             <div class="mt-4">
//               <h5>Hobby Statistics</h5>
//               <table class="table table-bordered">
//                 <thead>
//                   <tr>
//                     <th>Hobby</th>
//                     <th>Number of Users</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr *ngFor="let item of hobbyData">
//                     <td>{{ item.hobby }}</td>
//                     <td>{{ item.user_count }}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
          
//           <div *ngIf="hobbyData.length === 0" class="text-center">
//             <p>No hobby data available. Register some users first.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .chart-container {
//       position: relative;
//       margin: 20px 0;
//     }
//   `]
// })
// export class HobbiesGraphsComponent implements OnInit {
//   @ViewChild('hobbyChart') hobbyChartRef!: ElementRef;
  
//   hobbyData: any[] = [];
//   loading: boolean = false;
//   private chart: Chart | null = null;

//   constructor(private http: HttpClient) {
//     Chart.register(...registerables);
//   }

//   ngOnInit() {
//     this.loadHobbyData();
//   }

//   loadHobbyData() {
//     this.loading = true;
//     this.http.get('/api/users/analytics/hobbies').subscribe({
//       next: (data: any) => {
//         this.hobbyData = data;
//         this.loading = false;
        
//         // Destroy previous chart if exists
//         if (this.chart) {
//           this.chart.destroy();
//         }
        
//         // Create new chart
//         setTimeout(() => {
//           this.createChart();
//         }, 100);
//       },
//       error: (error) => {
//         console.error('Error loading hobby data:', error);
//         this.loading = false;
//       }
//     });
//   }

//   createChart() {
//     if (!this.hobbyChartRef || this.hobbyData.length === 0) {
//       return;
//     }

//     const ctx = this.hobbyChartRef.nativeElement.getContext('2d');
//     if (!ctx) return;

//     const labels = this.hobbyData.map(item => item.hobby);
//     const data = this.hobbyData.map(item => item.user_count);

//     this.chart = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: labels,
//         datasets: [{
//           label: 'Number of Users',
//           data: data,
//           backgroundColor: [
//             'rgba(54, 162, 235, 0.7)',
//             'rgba(255, 99, 132, 0.7)',
//             'rgba(255, 206, 86, 0.7)',
//             'rgba(75, 192, 192, 0.7)',
//             'rgba(153, 102, 255, 0.7)',
//             'rgba(255, 159, 64, 0.7)'
//           ],
//           borderColor: [
//             'rgba(54, 162, 235, 1)',
//             'rgba(255, 99, 132, 1)',
//             'rgba(255, 206, 86, 1)',
//             'rgba(75, 192, 192, 1)',
//             'rgba(153, 102, 255, 1)',
//             'rgba(255, 159, 64, 1)'
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true,
//             title: {
//               display: true,
//               text: 'Number of Users'
//             }
//           },
//           x: {
//             title: {
//               display: true,
//               text: 'Hobbies'
//             }
//           }
//         },
//         plugins: {
//           legend: {
//             display: true,
//             position: 'top',
//           },
//           tooltip: {
//             callbacks: {
//               label: function(context) {
//                 return `${context.dataset.label}: ${context.raw}`;
//               }
//             }
//           }
//         }
//       }
//     });
//   }
// }




// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-hobbies-graphs',
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <h4>Hobbies Analytics</h4>
//       </div>
//       <div class="card-body">
//         <div *ngIf="loading" class="text-center">
//           <div class="spinner-border text-primary" role="status">
//             <span class="visually-hidden">Loading...</span>
//           </div>
//         </div>
        
//         <div *ngIf="hobbyData.length > 0">
//           <h5>Hobby Distribution</h5>
//           <div style="height: 400px; width: 100%;">
//             <canvas #hobbyChart></canvas>
//           </div>
          
//           <div class="mt-4">
//             <h5>Hobby Statistics</h5>
//             <table class="table table-bordered">
//               <thead>
//                 <tr>
//                   <th>Hobby</th>
//                   <th>Number of Users</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr *ngFor="let item of hobbyData">
//                   <td>{{ item.hobby }}</td>
//                   <td>{{ item.user_count }}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
        
//         <div *ngIf="hobbyData.length === 0 && !loading" class="text-center">
//           <p>No hobby data available. Register some users first.</p>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     canvas {
//       max-height: 400px;
//     }
//     table {
//       margin-top: 20px;
//     }
//   `]
// })
// export class HobbiesGraphsComponent implements OnInit {
//   hobbyData: any[] = [];
//   loading: boolean = false;

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.loadHobbyData();
//   }

//   loadHobbyData() {
//     this.loading = true;
//     this.http.get('/api/users/analytics/hobbies').subscribe({
//       next: (data: any) => {
//         this.hobbyData = data;
//         this.loading = false;
//         this.renderChart();
//       },
//       error: (error) => {
//         console.error('Error loading hobby data:', error);
//         this.loading = false;
//       }
//     });
//   }

//   renderChart() {
//     // Simple chart rendering without external libraries
//     const canvas = document.createElement('canvas');
//     canvas.width = 800;
//     canvas.height = 400;
    
//     const ctx = canvas.getContext('2d');
//     if (ctx && this.hobbyData.length > 0) {
//       const maxValue = Math.max(...this.hobbyData.map(item => item.user_count));
//       const barWidth = 40;
//       const spacing = 20;
//       const startX = 60;
//       const startY = 350;
      
//       // Draw bars
//       this.hobbyData.forEach((item, index) => {
//         const x = startX + index * (barWidth + spacing);
//         const barHeight = (item.user_count / maxValue) * 300;
//         const y = startY - barHeight;
        
//         // Bar
//         ctx.fillStyle = '#007bff';
//         ctx.fillRect(x, y, barWidth, barHeight);
        
//         // Label
//         ctx.fillStyle = '#333';
//         ctx.font = '12px Arial';
//         ctx.textAlign = 'center';
//         ctx.fillText(item.hobby, x + barWidth/2, startY + 20);
        
//         // Value
//         ctx.fillText(item.user_count.toString(), x + barWidth/2, y - 10);
//       });
      
//       // Draw axes
//       ctx.beginPath();
//       ctx.moveTo(50, 20);
//       ctx.lineTo(50, startY);
//       ctx.lineTo(800, startY);
//       ctx.strokeStyle = '#333';
//       ctx.stroke();
      
//       // Replace the canvas in the template
//       const chartContainer = document.querySelector('#hobbyChart');
//       if (chartContainer) {
//         chartContainer.innerHTML = '';
//         chartContainer.appendChild(canvas);
//       }
//     }
//   }
// }