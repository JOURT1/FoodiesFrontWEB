import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent, SidebarMenuItem } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule, ToastModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  
  sidebarVisible = true;
  currentUser: User | null = null;

  // Datos de ejemplo para el sidebar
  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard', active: true },
    { label: 'Foodies', icon: 'pi-heart', route: '/foodies' },
    { label: 'Restaurantes', icon: 'pi-building', route: '/restaurantes' },
    { label: 'Beneficios', icon: 'pi-gift', route: '/beneficios' },
    { label: 'Cuenta', icon: 'pi-user', route: '/cuenta' }
  ];

  get userInfo() {
    return this.currentUser ? {
      name: `${this.currentUser.nombre} ${this.currentUser.apellido}`,
      email: this.currentUser.correo
    } : {
      name: 'Usuario Foodie',
      email: 'usuario@foodiesbnb.com'
    };
  }

  ngOnInit() {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Verificar autenticación al inicializar
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
    }
  }

  handleSidebarToggle() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarItemClick(item: SidebarMenuItem) {
    // Actualizar el elemento activo
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }

  onLogout() {
    this.authService.logout();
  }
}
