import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { LoginRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Verificar si viene del registro exitoso
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.messageService.add({
          severity: 'success',
          summary: '¡Cuenta creada exitosamente!',
          detail: 'Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión con tus credenciales.',
          life: 6000
        });
        
        // Pre-llenar el email si viene del registro
        if (params['email']) {
          this.loginForm.patchValue({ email: params['email'] });
        }
        
        // Limpiar los query parameters de la URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const credentials: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: '¡Bienvenido!',
            detail: 'Has iniciado sesión correctamente',
            life: 3000
          });
          // La navegación se maneja automáticamente en el AuthService
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error de login:', error);
          // Los errores se manejan automáticamente por el error interceptor
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para fácil acceso en el template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}