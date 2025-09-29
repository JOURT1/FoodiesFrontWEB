import { Component } from '@angular/core';
import { SidebarComponent, SidebarMenuItem } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  sidebarVisible = true;

  // Datos de ejemplo para el sidebar
  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard', active: true },
    { label: 'Restaurantes', icon: 'pi-building', route: '/restaurants' },
    { label: 'Reservas', icon: 'pi-calendar', route: '/reservations' },
    { label: 'Usuarios', icon: 'pi-users', route: '/users' },
    { label: 'Configuración', icon: 'pi-cog', route: '/settings' }
  ];

  userInfo = {
    name: 'Usuario Foodie',
    email: 'usuario@foodiesbnb.com'
  };

  handleSidebarToggle() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarItemClick(item: SidebarMenuItem) {
    console.log('Menú clickeado:', item);
    // Aquí puedes manejar la navegación
  }

  onLogout() {
    console.log('Logout solicitado');
    // Aquí manejas el logout
  }
}
