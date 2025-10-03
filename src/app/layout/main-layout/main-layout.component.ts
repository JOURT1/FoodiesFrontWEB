import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent, SidebarMenuItem } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';
import { RoleService, UserWithRoles } from '../../modules/dashboardFoodie/role.service';
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
  private roleService = inject(RoleService);
  private router = inject(Router);
  
  sidebarVisible = true;
  currentUser: User | null = null;
  userWithRoles: UserWithRoles | null = null;
  hasFoodieRole = false;
  userInfo = {
    name: 'Usuario Foodie',
    email: 'usuario@foodiesbnb.com'
  };

  // Datos de ejemplo para el sidebar
  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard', active: false },
    { label: 'Foodies', icon: 'pi-heart', route: '/foodies', active: false },
    { label: 'Restaurantes', icon: 'pi-building', route: '/restaurantes', active: false },
    { label: 'Beneficios', icon: 'pi-gift', route: '/beneficios', active: false },
    { label: 'Cuenta', icon: 'pi-user', route: '/cuenta', active: false }
  ];

  ngOnInit() {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateUserInfo(); // Update userInfo when user changes
      if (user) {
        this.checkUserRoles();
      }
    });
    
    // Verificar autenticación al inicializar
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
    } else {
      // Si ya está autenticado, obtener información del usuario
      this.authService.getUserInfo().subscribe({
        next: (user) => {
          // El usuario ya se actualiza en el AuthService
          this.updateUserInfo(); // Force update userInfo
        },
        error: (error) => {
          // Silent error handling - user will see fallback UI
        }
      });
      // También verificar roles
      this.checkUserRoles();
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

  private updateUserInfo() {
    if (this.currentUser) {
      const nombre = this.currentUser.nombre || 'Usuario';
      const apellido = this.currentUser.apellido || '';
      const correo = this.currentUser.correo || 'sin-email@foodiesbnb.com';
      
      this.userInfo = {
        name: `${nombre} ${apellido}`.trim(),
        email: correo
      };
    } else {
      this.userInfo = {
        name: 'Usuario Foodie',
        email: 'usuario@foodiesbnb.com'
      };
    }
  }

  private checkUserRoles() {
    this.roleService.getCurrentUserWithRoles().subscribe({
      next: (userWithRoles) => {
        this.userWithRoles = userWithRoles;
        this.hasFoodieRole = this.roleService.hasFoodieRole(userWithRoles);
        this.updateFoodiesMenuItem();
      },
      error: (error) => {
        console.error('Error obteniendo roles del usuario:', error);
        // En caso de error, asumir que no tiene rol de foodie y mostrar formulario
        this.hasFoodieRole = false;
        this.updateFoodiesMenuItem();
      }
    });
  }

  private updateFoodiesMenuItem() {
    // Encontrar el item de Foodies y actualizar su ruta según el rol
    const foodiesItem = this.menuItems.find(item => item.label === 'Foodies');
    if (foodiesItem) {
      if (this.hasFoodieRole) {
        foodiesItem.route = '/dashboard-foodie';
      } else {
        foodiesItem.route = '/formulario-foodie';
      }
    }
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
    
    // Casos especiales para rutas específicas
    if (currentUrl === '/dashboard-foodie' || currentUrl === '/formulario-foodie') {
      const foodieItem = this.menuItems.find(item => item.label === 'Foodies');
      if (foodieItem) {
        foodieItem.active = true;
        return;
      }
    }
    
    // Encontrar y activar el elemento que coincide con la URL actual
    // Buscar coincidencia exacta primero
    let activeItem = this.menuItems.find(menuItem => 
      menuItem.route && currentUrl === menuItem.route
    );
    
    // Si no hay coincidencia exacta, buscar por startsWith pero evitar conflictos
    if (!activeItem) {
      // Ordenar por longitud de ruta (más específicas primero)
      const sortedItems = this.menuItems
        .filter(item => item.route && item.route !== '/dashboard') // Excluir dashboard para evitar conflictos
        .sort((a, b) => (b.route?.length || 0) - (a.route?.length || 0));
      
      activeItem = sortedItems.find(menuItem => 
        menuItem.route && currentUrl.startsWith(menuItem.route!)
      );
      
      // Si aún no hay coincidencia y la URL empieza con /dashboard, activar Dashboard
      if (!activeItem && currentUrl.startsWith('/dashboard')) {
        activeItem = this.menuItems.find(item => item.route === '/dashboard');
      }
    }
    
    if (activeItem) {
      activeItem.active = true;
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
