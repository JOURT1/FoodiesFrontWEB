import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent, SidebarMenuItem } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule, ToastModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  sidebarVisible = true;
  currentUser: User | null = null;

  // Datos de ejemplo para el sidebar
  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard', active: false },
    { label: 'Foodies', icon: 'pi-heart', route: '/foodies', active: false },
    { label: 'Restaurantes', icon: 'pi-building', route: '/restaurantes', active: false },
    { label: 'Beneficios', icon: 'pi-gift', route: '/beneficios', active: false },
    { label: 'Cuenta', icon: 'pi-user', route: '/cuenta', active: false }
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

    // Suscribirse a los cambios de ruta para actualizar el elemento activo
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveMenuItem(event.url);
    });

    // Establecer el elemento activo inicial
    this.updateActiveMenuItem(this.router.url);
  }

  handleSidebarToggle() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarItemClick(item: SidebarMenuItem) {
    // Navegar a la ruta
    this.router.navigate([item.route]);
  }

  private updateActiveMenuItem(currentUrl: string) {
    // Limpiar todos los elementos activos
    this.menuItems.forEach(menuItem => menuItem.active = false);
    
    // Encontrar y activar el elemento que coincide con la URL actual
    const activeItem = this.menuItems.find(menuItem => 
      menuItem.route && currentUrl.startsWith(menuItem.route)
    );
    
    if (activeItem) {
      activeItem.active = true;
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
