import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FoodieApplicationModel } from '../../core/models/foodie-application.model';

@Component({
  selector: 'app-formulario-foodie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './formulario-foodie.component.html',
  styleUrls: ['./formulario-foodie.component.css']
})
export class FormularioFoodieComponent implements OnInit {
  
  foodieForm!: FormGroup;
  isSaving = false;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {}
  
  // Opciones para los selectores
  readonly paisesDisponibles = [
    { value: 'ecuador', label: 'Ecuador' }
  ];
  
  readonly ciudadesDisponibles = [
    { value: 'quito', label: 'Quito' },
    { value: 'guayaquil', label: 'Guayaquil' }
  ];
  
  readonly frecuenciaContenido = [
    { value: 'diario', label: 'Diariamente' },
    { value: 'varios-por-semana', label: 'Varias veces por semana' },
    { value: 'semanal', label: 'Semanalmente' },
    { value: 'quincenal', label: 'Cada dos semanas' },
    { value: 'mensual', label: 'Mensualmente' }
  ];
  
  readonly generoOpciones = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' }
  ];
  
  readonly cuentaPublicaOpciones = [
    { value: true, label: 'Sí, es pública.' },
    { value: false, label: 'No, es privada.' }
  ];
  
  readonly beneficiosOpciones = [
    { value: 'acepto', label: 'Sí, estoy de acuerdo con los beneficios ofrecidos.' },
    { value: 'no-acepto', label: 'No, no estoy de acuerdo con los beneficios. (no envíes tu aplicación)' }
  ];

  ngOnInit(): void {
    console.log('FormularioFoodieComponent inicializado');
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    this.foodieForm = this.formBuilder.group({
      // Información personal
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      numeroPersonal: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      
      // Ubicación
      pais: ['ecuador', [Validators.required]],
      ciudad: ['', [Validators.required]],
      
      // Redes sociales
      frecuenciaContenido: ['', [Validators.required]],
      usuarioInstagram: ['', [Validators.required, Validators.pattern(/^@[a-zA-Z0-9._]+$/)]],
      seguidoresInstagram: ['', [Validators.required, Validators.min(1000), Validators.pattern(/^\d+$/)]],
      cuentaPublica: [null, [Validators.required]],
      usuarioTikTok: ['', [Validators.required, Validators.pattern(/^@[a-zA-Z0-9._]+$/)]],
      seguidoresTikTok: ['', [Validators.required, Validators.min(1000), Validators.pattern(/^\d+$/)]],
      
      // Descripción y términos
      sobreTi: ['', [Validators.required, Validators.minLength(20)]],
      aceptaBeneficios: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.foodieForm.valid) {
      this.isSaving = true;
      const formData: FoodieApplicationModel = this.buildApplicationModel();
      await this.procesarSolicitud(formData);
      this.isSaving = false;
    } else {
      this.marcarCamposInvalidos();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, completa todos los campos requeridos correctamente.',
        life: 5000
      });
    }
  }

  private buildApplicationModel(): FoodieApplicationModel {
    const formValue = this.foodieForm.value;
    
    return {
      nombreCompleto: formValue.nombreCompleto.trim(),
      email: formValue.email.toLowerCase().trim(),
      numeroPersonal: formValue.numeroPersonal,
      fechaNacimiento: new Date(formValue.fechaNacimiento),
      genero: formValue.genero,
      pais: formValue.pais,
      ciudad: formValue.ciudad,
      frecuenciaContenido: formValue.frecuenciaContenido,
      usuarioInstagram: formValue.usuarioInstagram.trim(),
      seguidoresInstagram: parseInt(formValue.seguidoresInstagram),
      cuentaPublica: formValue.cuentaPublica,
      usuarioTikTok: formValue.usuarioTikTok.trim(),
      seguidoresTikTok: parseInt(formValue.seguidoresTikTok),
      sobreTi: formValue.sobreTi.trim(),
      aceptaBeneficios: formValue.aceptaBeneficios,
      aceptaTerminos: formValue.aceptaTerminos,
      fechaAplicacion: new Date()
    };
  }

  private async procesarSolicitud(formData: FoodieApplicationModel): Promise<void> {
    // TODO: Implementar envío de datos al backend
    console.log('Solicitud de Foodie:', formData);
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: '¡Solicitud enviada exitosamente! Te contactaremos pronto.',
      life: 6000
    });
    this.resetearFormulario();
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.foodieForm.controls).forEach(key => {
      const control = this.foodieForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  private resetearFormulario(): void {
    this.foodieForm.reset();
    this.inicializarFormulario();
  }

  // Getters para validaciones en el template
  get nombreCompletoInvalid(): boolean {
    const control = this.foodieForm.get('nombreCompleto');
    return !!(control && control.invalid && control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.foodieForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get numeroPersonalInvalid(): boolean {
    const control = this.foodieForm.get('numeroPersonal');
    return !!(control && control.invalid && control.touched);
  }

  get usuarioInstagramInvalid(): boolean {
    const control = this.foodieForm.get('usuarioInstagram');
    return !!(control && control.invalid && control.touched);
  }

  get seguidoresInstagramInvalid(): boolean {
    const control = this.foodieForm.get('seguidoresInstagram');
    return !!(control && control.invalid && control.touched);
  }

  get usuarioTikTokInvalid(): boolean {
    const control = this.foodieForm.get('usuarioTikTok');
    return !!(control && control.invalid && control.touched);
  }

  get seguidoresTikTokInvalid(): boolean {
    const control = this.foodieForm.get('seguidoresTikTok');
    return !!(control && control.invalid && control.touched);
  }

  get sobreTiInvalid(): boolean {
    const control = this.foodieForm.get('sobreTi');
    return !!(control && control.invalid && control.touched);
  }

  get caracteresRestantes(): number {
    const sobreTi = this.foodieForm.get('sobreTi')?.value || '';
    return Math.max(0, 20 - sobreTi.length);
  }

  get caracteresTotales(): number {
    const sobreTi = this.foodieForm.get('sobreTi')?.value || '';
    return sobreTi.length;
  }

  // Métodos para validar entrada de seguidores
  onSeguidoresKeypress(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const char = String.fromCharCode(charCode);
    
    // Solo permitir números (0-9)
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSeguidoresPaste(event: ClipboardEvent): boolean {
    const pastedText = event.clipboardData?.getData('text') || '';
    // Solo permitir texto que contenga solo números
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSeguidoresInput(event: any, fieldName: string): void {
    let value = event.target.value;
    // Remover cualquier carácter que no sea número
    value = value.replace(/[^0-9]/g, '');
    // Actualizar el valor en el formulario
    this.foodieForm.get(fieldName)?.setValue(value);
  }
}