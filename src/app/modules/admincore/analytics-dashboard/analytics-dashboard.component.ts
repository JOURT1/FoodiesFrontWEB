import { Component, OnInit } from '@angular/core';
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

  constructor(private adminService: AdminCoreService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.errorMessage = '';
    
    this.adminService.getResumenGeneral().subscribe({
      next: (data) => {
        this.resumen = data;
        this.hasData = data.totalUsuarios > 0 || data.totalReservas > 0;
        this.loading = false;
        if (this.hasData) {
          setTimeout(() => this.createCharts(), 100);
        }
      },
      error: (error) => {
        console.error('Error cargando resumen:', error);
        this.errorMessage = 'Error al cargar los datos. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });

    this.adminService.getRestaurantesAnalytics().subscribe({
      next: (data) => {
        this.restaurantesAnalytics = data;
        if (data.length > 0) {
          setTimeout(() => this.createRestaurantesChart(), 100);
        }
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
      }
    });

    this.adminService.getTendencias().subscribe({
      next: (data) => {
        this.tendencias = data;
        if (data.length > 0) {
          setTimeout(() => this.createTendenciasChart(), 100);
        }
      },
      error: (error) => {
        console.error('Error cargando tendencias:', error);
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
