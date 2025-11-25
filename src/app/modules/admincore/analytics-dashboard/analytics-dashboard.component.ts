import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCoreService } from '../../../core/services/admin-core.service';
import { ResumenGeneralDto, RestauranteAnalyticsDto, TendenciaVisitasDto } from '../../../core/models/admincore.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  resumen: ResumenGeneralDto | null = null;
  restaurantesAnalytics: RestauranteAnalyticsDto[] = [];
  tendencias: TendenciaVisitasDto[] = [];
  loading = true;
  hasData = false;
  errorMessage = '';

  constructor(
    private adminService: AdminCoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.errorMessage = '';
    
    // Contador para saber cuándo terminan todas las peticiones
    let completedRequests = 0;
    const totalRequests = 3;
    
    const checkIfAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        console.log('Todas las peticiones completadas');
        console.log('Resumen:', this.resumen);
        console.log('Restaurantes:', this.restaurantesAnalytics);
        console.log('Tendencias:', this.tendencias);
        
        // Verificar si hay datos (aunque sean pocos)
        if (this.resumen) {
          this.hasData = true;
          this.loading = false;
          console.log('hasData se estableció en true');
          console.log('loading se estableció en false');
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Dar tiempo al DOM para renderizar antes de crear gráficos
          setTimeout(() => {
            console.log('Creando gráficos...');
            this.createCharts();
            if (this.restaurantesAnalytics.length > 0) {
              this.createRestaurantesChart();
            }
            if (this.tendencias.length > 0) {
              this.createTendenciasChart();
            }
          }, 200);
        } else {
          this.hasData = false;
          this.loading = false;
          this.cdr.detectChanges();
          console.log('No hay resumen disponible');
        }
      }
    };
    
    this.adminService.getResumenGeneral().subscribe({
      next: (data) => {
        console.log('Resumen General recibido:', data);
        this.resumen = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando resumen:', error);
        this.errorMessage = 'Error al cargar los datos. Por favor, intenta nuevamente.';
        checkIfAllLoaded();
      }
    });

    this.adminService.getRestaurantesAnalytics().subscribe({
      next: (data) => {
        console.log('Restaurantes Analytics recibido:', data);
        this.restaurantesAnalytics = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        checkIfAllLoaded();
      }
    });

    this.adminService.getTendencias().subscribe({
      next: (data) => {
        console.log('Tendencias recibidas:', data);
        this.tendencias = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando tendencias:', error);
        checkIfAllLoaded();
      }
    });
  }

  createCharts() {
    if (!this.resumen) return;

    // Gráfico de resumen general
    const ctx = document.getElementById('resumenChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Foodies', 'Restaurantes', 'Usuarios Regulares'],
          datasets: [{
            data: [
              this.resumen.totalFoodies,
              this.resumen.totalRestaurantes,
              this.resumen.totalUsuarios - this.resumen.totalFoodies - this.resumen.totalRestaurantes
            ],
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Distribución de Usuarios'
            }
          }
        }
      });
    }

    // Gráfico de reservas
    const ctxReservas = document.getElementById('reservasChart') as HTMLCanvasElement;
    if (ctxReservas) {
      new Chart(ctxReservas, {
        type: 'pie',
        data: {
          labels: ['Completadas', 'Pendientes'],
          datasets: [{
            data: [
              this.resumen.totalReservasCompletadas,
              this.resumen.totalReservas - this.resumen.totalReservasCompletadas
            ],
            backgroundColor: ['#4CAF50', '#FFC107']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Estado de Reservas'
            }
          }
        }
      });
    }
  }

  createRestaurantesChart() {
    const ctx = document.getElementById('restaurantesChart') as HTMLCanvasElement;
    if (ctx && this.restaurantesAnalytics.length > 0) {
      const top10 = this.restaurantesAnalytics.slice(0, 10);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map(r => r.nombreRestaurante),
          datasets: [{
            label: 'Total Reservas',
            data: top10.map(r => r.totalReservas),
            backgroundColor: '#2196F3'
          }, {
            label: 'Ingreso Total ($)',
            data: top10.map(r => r.ingresoTotal),
            backgroundColor: '#4CAF50'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Restaurantes - Reservas e Ingresos'
            }
          }
        }
      });
    }
  }

  createTendenciasChart() {
    const ctx = document.getElementById('tendenciasChart') as HTMLCanvasElement;
    if (ctx && this.tendencias.length > 0) {
      const datasets = this.tendencias.slice(0, 5).map((tendencia, index) => {
        const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
        return {
          label: tendencia.nombreRestaurante,
          data: tendencia.visitasMensuales.map(v => v.cantidadVisitas),
          borderColor: colors[index],
          backgroundColor: colors[index] + '20',
          tension: 0.4
        };
      });

      const labels = this.tendencias[0]?.visitasMensuales.map(v => v.nombreMes) || [];

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Tendencias de Visitas Mensuales (Top 5 Restaurantes)'
            },
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
}
