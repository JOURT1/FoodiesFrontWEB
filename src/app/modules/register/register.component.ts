import { Component, OnInit, Injector } from '@angular/core';
import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { FormularioComun } from '../../shared/components/form/formulario-comun';
import { FORM_SHARED_IMPORTS } from '../../shared/components/form/form_imports';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ...FORM_SHARED_IMPORTS, // imports genéricos de clases
    ToastComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent extends FormularioComun implements OnInit {
  isLoading = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.registraControl();
  }

  override registraControl(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator()]]
    });
  }

  passwordMatchValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.form) return null;
      
      const password = this.form.get('password')?.value;
      const confirmPassword = control.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
      }

      return null;
    };
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
          detail: 'Registro exitoso. ¡Bienvenido a FoodiesBNB!'
        });
        // Redirigir al login o dashboard
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }, 1500);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos'
      });
      this.markFormGroupTouched();
    }
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Debe ser un email válido';
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nombre': 'El nombre',
      'apellido': 'El apellido',
      'email': 'El email',
      'password': 'La contraseña',
      'confirmPassword': 'La confirmación de contraseña'
    };
    return labels[fieldName] || fieldName;
  }
}