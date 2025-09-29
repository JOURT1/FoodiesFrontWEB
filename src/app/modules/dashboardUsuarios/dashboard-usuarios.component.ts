import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-usuarios.component.html',
  styleUrls: ['./dashboard-usuarios.component.css']
})
export class DashboardUsuariosComponent implements OnInit {
  
  searchTerm: string = '';
  selectedUbicacion: string = '';
  selectedTipoCocina: string = '';
  
  restaurantes = [
    {
      id: 1,
      nombre: 'Macchiata',
      tipo: 'BRUNCH - PIZZA - PASTA',
      ubicacion: 'La Primavera I en Cumbayá, Ecuador',
      imagen: '/img/Login.webp'
    },
    {
      id: 2,
      nombre: "Michael's",
      tipo: 'GRILL',
      ubicacion: 'Quito, Guayaquil',
      imagen: '/img/Login.webp'
    },
    {
      id: 3,
      nombre: 'Roll It',
      tipo: 'SUSHI',
      ubicacion: 'Quito, Cumbayá',
      imagen: '/img/Login.webp'
    }
  ];
  
  restaurantesFiltrados = [...this.restaurantes];

  constructor() {}

  ngOnInit(): void {
    this.filtrarRestaurantes();
  }

  onSearch() {
    this.filtrarRestaurantes();
  }
  
  onUbicacionChange(event: any) {
    this.selectedUbicacion = event.target.value;
    this.filtrarRestaurantes();
  }
  
  onTipoCocinaChange(event: any) {
    this.selectedTipoCocina = event.target.value;
    this.filtrarRestaurantes();
  }
  
  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.filtrarRestaurantes();
  }
  
  filtrarRestaurantes() {
    this.restaurantesFiltrados = this.restaurantes.filter(restaurante => {
      const matchNombre = restaurante.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchUbicacion = !this.selectedUbicacion || restaurante.ubicacion.toLowerCase().includes(this.selectedUbicacion.toLowerCase());
      const matchTipo = !this.selectedTipoCocina || restaurante.tipo.toLowerCase().includes(this.selectedTipoCocina.toLowerCase());
      
      return matchNombre && matchUbicacion && matchTipo;
    });
  }
}