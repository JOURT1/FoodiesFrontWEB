import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCoreService } from '../../../core/services/admin-core.service';
import { ResumenGeneralDto, RestauranteAnalyticsDto, TendenciaVisitasDto, ReservasPorFechaDto } from '../../../core/models/admincore.model';
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
  reservasPorFecha: ReservasPorFechaDto[] = [];
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
    const totalRequests = 4;
    
    const checkIfAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        console.log('Todas las peticiones completadas');
        console.log('Resumen:', this.resumen);
        console.log('Restaurantes:', this.restaurantesAnalytics);
        console.log('Tendencias:', this.tendencias);
        console.log('Reservas por Fecha:', this.reservasPorFecha);
        
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
            this.createReservasChart();
            if (this.restaurantesAnalytics.length > 0) {
              this.createRestaurantesChart();
            }
            if (this.tendencias.length > 0) {
              this.createTendenciasChart();
            }
            if (this.reservasPorFecha.length > 0) {
              this.createReservasPorFechaChart();
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

    this.adminService.getReservasPorFecha().subscribe({
      next: (data) => {
        console.log('Reservas por Fecha recibidas:', data);
        this.reservasPorFecha = data;
        checkIfAllLoaded();
      },
      error: (error) => {
        console.error('Error cargando reservas por fecha:', error);
        checkIfAllLoaded();
      }
    });
  }

  createReservasChart() {
    if (!this.resumen) return;

    // Gráfico de estado de reservas
    const ctxReservas = document.getElementById('reservasChart') as HTMLCanvasElement;
    if (ctxReservas) {
      new Chart(ctxReservas, {
        type: 'doughnut',
        data: {
          labels: ['Completadas', 'Pendientes'],
          datasets: [{
            data: [
              this.resumen.totalReservasCompletadas,
              this.resumen.totalReservas - this.resumen.totalReservasCompletadas
            ],
            backgroundColor: ['#4CAF50', '#FFC107'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }

  createRestaurantesChart() {
    const ctx = document.getElementById('restaurantesChart') as HTMLCanvasElement;
    if (ctx && this.restaurantesAnalytics.length > 0) {
      const todosRestaurantes = this.restaurantesAnalytics;
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: todosRestaurantes.map(r => r.nombreRestaurante),
          datasets: [{
            label: 'Reservas',
            data: todosRestaurantes.map(r => r.totalReservas),
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          }, {
            label: 'Ingresos ($)',
            data: todosRestaurantes.map(r => r.ingresoTotal),
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e0e0e0'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }

  createTendenciasChart() {
    const ctx = document.getElementById('tendenciasChart') as HTMLCanvasElement;
    if (ctx && this.tendencias.length > 0) {
      const datasets: any[] = [];
      const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#E91E63', '#3F51B5'];
      
      // Crear datasets para cada restaurante
      this.tendencias.forEach((tendencia, index) => {
        const color = colors[index % colors.length];
        
        if (tendencia.visitasMensuales.length === 0) {
          return; // Saltar si no hay datos
        }
        
        // Puntos de datos históricos con etiquetas de mes
        const puntosHistoricos = tendencia.visitasMensuales.map((v, i) => ({
          x: i + 1,
          y: v.cantidadVisitas,
          label: v.nombreMes
        }));
        
        // Dataset principal: Línea curva con puntos
        datasets.push({
          label: tendencia.nombreRestaurante,
          data: puntosHistoricos,
          backgroundColor: color + '40', // Semi-transparente
          borderColor: color,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBorderWidth: 2,
          borderWidth: 3,
          showLine: true, // Mostrar línea conectando puntos
          tension: 0.4, // Curva suave (0 = recta, 1 = muy curva)
          fill: false,
          type: 'line'
        });
        
        // Agregar punto de predicción si existe
        if (tendencia.prediccion && tendencia.prediccion.visitasPredichas > 0) {
          const puntoPrediccion = [{
            x: tendencia.visitasMensuales.length + 1,
            y: tendencia.prediccion.visitasPredichas,
            label: tendencia.prediccion.nombreMesSiguiente + ' (Predicción)'
          }];
          
          // Línea punteada de extensión hacia la predicción
          const lineaExtension = [
            {
              x: tendencia.visitasMensuales.length,
              y: tendencia.visitasMensuales[tendencia.visitasMensuales.length - 1].cantidadVisitas
            },
            {
              x: tendencia.visitasMensuales.length + 1,
              y: tendencia.prediccion.visitasPredichas
            }
          ];
          
          datasets.push({
            label: tendencia.nombreRestaurante + ' (extensión)',
            data: lineaExtension,
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [8, 4],
            pointRadius: 0,
            showLine: true,
            tension: 0.4,
            fill: false,
            type: 'line'
          });
          
          // Punto de predicción destacado
          datasets.push({
            label: tendencia.nombreRestaurante + ' (futuro)',
            data: puntoPrediccion,
            backgroundColor: color,
            borderColor: '#FFD700',
            borderWidth: 3,
            pointRadius: 10,
            pointHoverRadius: 12,
            pointStyle: 'star',
            showLine: false,
            type: 'scatter'
          });
        }
      });

      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 11
                },
                usePointStyle: true,
                filter: function(item) {
                  // Ocultar líneas de extensión y predicciones en leyenda
                  return !item.text.includes('(extensión)') && !item.text.includes('(futuro)');
                }
              }
            },
            tooltip: {
              callbacks: {
                title: function(context: any) {
                  const dataPoint = context[0].raw;
                  return dataPoint.label || 'Período ' + dataPoint.x;
                },
                label: function(context: any) {
                  const label = context.dataset.label || '';
                  if (label.includes('(futuro)')) {
                    return '🌟 Predicción: ' + Math.round(context.parsed.y) + ' visitas';
                  }
                  if (label.includes('(extensión)')) {
                    return ''; // No mostrar tooltip para líneas de extensión
                  }
                  return label + ': ' + Math.round(context.parsed.y) + ' visitas';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              },
              ticks: {
                stepSize: 5,
                font: {
                  size: 11
                }
              },
              title: {
                display: true,
                text: 'Cantidad de Visitas/Reservas',
                font: {
                  size: 13,
                  weight: 'bold'
                },
                color: '#2c3e50'
              }
            },
            x: {
              type: 'linear',
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              },
              ticks: {
                stepSize: 1,
                font: {
                  size: 11
                },
                callback: function(value: any) {
                  return 'Mes ' + value;
                }
              },
              title: {
                display: true,
                text: 'Tiempo (Períodos Mensuales)',
                font: {
                  size: 13,
                  weight: 'bold'
                },
                color: '#2c3e50'
              }
            }
          }
        }
      });
    }
  }

  createReservasPorFechaChart() {
    if (!this.reservasPorFecha || this.reservasPorFecha.length === 0) return;

    const ctx = document.getElementById('reservasPorFechaChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Colores para cada restaurante
    const colores = [
      { punto: 'rgba(54, 162, 235, 0.8)', linea: 'rgba(54, 162, 235, 0.3)', prediccion: 'rgba(54, 162, 235, 1)' },
      { punto: 'rgba(255, 99, 132, 0.8)', linea: 'rgba(255, 99, 132, 0.3)', prediccion: 'rgba(255, 99, 132, 1)' },
      { punto: 'rgba(75, 192, 192, 0.8)', linea: 'rgba(75, 192, 192, 0.3)', prediccion: 'rgba(75, 192, 192, 1)' },
      { punto: 'rgba(255, 206, 86, 0.8)', linea: 'rgba(255, 206, 86, 0.3)', prediccion: 'rgba(255, 206, 86, 1)' },
      { punto: 'rgba(153, 102, 255, 0.8)', linea: 'rgba(153, 102, 255, 0.3)', prediccion: 'rgba(153, 102, 255, 1)' }
    ];

    const datasets: any[] = [];

    this.reservasPorFecha.forEach((restaurante, index) => {
      const color = colores[index % colores.length];
      
      // Dataset de puntos reales
      const puntosReales = restaurante.puntos.map(p => ({
        x: p.diaRelativo,
        y: p.numeroPersonas
      }));

      datasets.push({
        label: restaurante.nombreRestaurante,
        data: puntosReales,
        backgroundColor: color.punto,
        borderColor: color.punto,
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: true,
        tension: 0.4,
        fill: false
      });

      // Dataset de línea de regresión (función de ajuste)
      if (restaurante.puntos.length > 0) {
        const minX = Math.min(...restaurante.puntos.map(p => p.diaRelativo));
        const maxX = Math.max(...restaurante.puntos.map(p => p.diaRelativo));
        
        // Solo 2 puntos para la línea de regresión (es una línea recta)
        const puntosRegresion = [
          { 
            x: minX, 
            y: restaurante.funcionAjuste.pendiente * minX + restaurante.funcionAjuste.intercepto 
          },
          { 
            x: maxX + 7, // Extender hasta la predicción
            y: restaurante.funcionAjuste.pendiente * (maxX + 7) + restaurante.funcionAjuste.intercepto 
          }
        ];

        datasets.push({
          label: `${restaurante.nombreRestaurante} (Función de Ajuste)`,
          data: puntosRegresion,
          borderColor: color.linea,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          showLine: true,
          tension: 0
        });

        // Punto de predicción próxima semana
        const ultimoDia = maxX;
        const prediccionDia = ultimoDia + 7;
        const prediccionPersonas = restaurante.funcionAjuste.prediccionProximaSemana;

        datasets.push({
          label: `${restaurante.nombreRestaurante} (Predicción)`,
          data: [{ x: prediccionDia, y: prediccionPersonas }],
          backgroundColor: color.prediccion,
          borderColor: '#FFD700',
          borderWidth: 3,
          pointRadius: 10,
          pointStyle: 'star',
          pointHoverRadius: 12,
          showLine: false
        });
      }
    });

    new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500 // Reducir duración de animación
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12 },
              filter: function(item: any) {
                // Ocultar datasets de función de ajuste y predicción del legend
                return !item.text.includes('(Función de Ajuste)') && !item.text.includes('(Predicción)');
              }
            }
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                if (label.includes('(Función de Ajuste)')) {
                  return '';
                }
                if (label.includes('(Predicción)')) {
                  return `Predicción (+7 días): ${context.parsed.y.toFixed(1)} personas`;
                }
                return `${label}: ${context.parsed.y} personas (Día ${context.parsed.x})`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Días desde primera reserva',
              font: { size: 13, weight: 'bold' },
              color: '#2c3e50'
            },
            ticks: {
              stepSize: 5,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Personas por Reserva',
              font: { size: 13, weight: 'bold' },
              color: '#2c3e50'
            },
            ticks: {
              stepSize: 2,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }
}
