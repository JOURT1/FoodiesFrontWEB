import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormularioFoodieService } from '../../core/services/formulario-foodie.service';
import { FormularioFoodieCreate, FormularioFoodieUpdate } from '../../core/models/formulario-foodie.model';

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
  isEditing = false;
  formularioId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private formularioFoodieService: FormularioFoodieService
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
    this.verificarFormularioExistente();
  }

  private async verificarFormularioExistente(): Promise<void> {
    try {
      const formulario = await this.formularioFoodieService.getMyFormulario().toPromise();
      if (formulario) {
        this.isEditing = true;
        this.formularioId = formulario.id;
        this.cargarDatosFormulario(formulario);
        this.messageService.add({
          severity: 'info',
          summary: 'Información',
          detail: 'Ya tienes un formulario registrado. Puedes actualizarlo.',
          life: 5000
        });
      }
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Error al verificar formulario existente:', error);
      }
    }
  }

  private cargarDatosFormulario(formulario: any): void {
    this.foodieForm.patchValue({
      nombreCompleto: formulario.nombreCompleto,
      email: formulario.email,
      numeroPersonal: formulario.numeroPersonal,
      fechaNacimiento: new Date(formulario.fechaNacimiento),
      genero: formulario.genero,
      pais: formulario.pais,
      ciudad: formulario.ciudad,
      frecuenciaContenido: formulario.frecuenciaContenido,
      usuarioInstagram: formulario.usuarioInstagram,
      seguidoresInstagram: formulario.seguidoresInstagram.toString(),
      cuentaPublica: formulario.cuentaPublica,
      usuarioTikTok: formulario.usuarioTikTok,
      seguidoresTikTok: formulario.seguidoresTikTok.toString(),
      sobreTi: formulario.sobreTi,
      aceptaBeneficios: formulario.aceptaBeneficios,
      aceptaTerminos: formulario.aceptaTerminos
    });
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
      try {
        if (this.isEditing) {
          await this.actualizarFormulario();
        } else {
          await this.crearFormulario();
        }
      } catch (error) {
        console.error('Error al procesar formulario:', error);
      } finally {
        this.isSaving = false;
      }
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

  private async crearFormulario(): Promise<void> {
    const formData: FormularioFoodieCreate = this.buildCreateModel();
    
    this.formularioFoodieService.create(formData).subscribe({
      next: (response) => {
        // Mensaje principal de éxito
        this.messageService.add({
          severity: 'success',
          summary: '🎉 ¡Formulario Enviado Exitosamente!',
          detail: 'Tu aplicación para ser Foodie ha sido registrada correctamente. Te contactaremos pronto.',
          life: 8000
        });
        
        this.isEditing = true;
        this.formularioId = response.id;
        
        // Verificar si cumple requisitos para rol foodie
        if (response.seguidoresInstagram >= 1000 || response.seguidoresTikTok >= 1000) {
          setTimeout(() => {
            this.messageService.add({
              severity: 'success',
              summary: '🌟 ¡Felicitaciones, eres Foodie!',
              detail: `¡Increíble! Con ${response.seguidoresInstagram} seguidores en Instagram y ${response.seguidoresTikTok} en TikTok, has obtenido automáticamente el rol de Foodie. ¡Disfruta de todos los beneficios!`,
              life: 10000
            });
          }, 1500);
        } else {
          setTimeout(() => {
            this.messageService.add({
              severity: 'info',
              summary: '📈 Sigue creciendo',
              detail: 'Necesitas al menos 1,000 seguidores en Instagram o TikTok para obtener el rol Foodie automáticamente. ¡Sigue creando contenido increíble!',
              life: 7000
            });
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error al crear formulario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al enviar',
          detail: 'Hubo un problema al enviar tu formulario. Por favor, inténtalo nuevamente.',
          life: 6000
        });
      }
    });
  }

  private async actualizarFormulario(): Promise<void> {
    const formData: FormularioFoodieUpdate = this.buildUpdateModel();
    
    this.formularioFoodieService.updateMyFormulario(formData).subscribe({
      next: (response) => {
        // Mensaje principal de actualización
        this.messageService.add({
          severity: 'success',
          summary: '✅ Información Actualizada',
          detail: 'Tus datos han sido actualizados correctamente. Gracias por mantenerte al día.',
          life: 6000
        });
        
        // Verificar si ahora cumple requisitos para rol foodie
        if (response.seguidoresInstagram >= 1000 || response.seguidoresTikTok >= 1000) {
          setTimeout(() => {
            this.messageService.add({
              severity: 'success',
              summary: '🎊 ¡Ahora eres Foodie!',
              detail: `¡Genial! Con tus nuevos números de seguidores (${response.seguidoresInstagram} en Instagram, ${response.seguidoresTikTok} en TikTok), ahora tienes el rol Foodie. ¡Disfruta de los beneficios!`,
              life: 9000
            });
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error al actualizar formulario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al actualizar',
          detail: 'Hubo un problema al actualizar tu información. Por favor, inténtalo nuevamente.',
          life: 6000
        });
      }
    });
  }

  private buildCreateModel(): FormularioFoodieCreate {
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
      aceptaTerminos: formValue.aceptaTerminos
    };
  }

  private buildUpdateModel(): FormularioFoodieUpdate {
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
      aceptaTerminos: formValue.aceptaTerminos
    };
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.foodieForm.controls).forEach(key => {
      const control = this.foodieForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
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