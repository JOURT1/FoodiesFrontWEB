import { Component, OnInit, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { FormularioComun } from '../../shared/components/form/formulario-comun';
import { FORM_SHARED_IMPORTS } from '../../shared/components/form/form_imports';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ...FORM_SHARED_IMPORTS, // imports genéricos de clases
    ToastComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent extends FormularioComun implements OnInit {
  isLoading = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.registraControl();
  }

  override registraControl(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  override async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.isLoading = true;
      
      // Simular llamada al API por ahora
      setTimeout(() => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Inicio de sesión exitoso'
        });
        // Redirigir al dashboard o página principal
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      }, 1500);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos'
      });
    }
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  onSocialLogin(provider: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: `Login con ${provider} en desarrollo`
    });
  }
}
