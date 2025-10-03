export interface FoodieApplicationModel {
  // Información personal
  nombreCompleto: string;
  email: string;
  numeroPersonal: string;
  fechaNacimiento: Date;
  genero: string;
  
  // Ubicación
  pais: string;
  ciudad: string;
  
  // Redes sociales
  frecuenciaContenido: string;
  usuarioInstagram: string;
  seguidoresInstagram: number;
  cuentaPublica: boolean;
  usuarioTikTok: string;
  seguidoresTikTok: number;
  
  // Descripción y términos
  sobreTi: string;
  aceptaBeneficios: string;
  aceptaTerminos: boolean;
  
  // Metadatos
  fechaAplicacion: Date;
}

export interface FoodieApplicationRequest {
  nombreCompleto: string;
  email: string;
  numeroPersonal: string;
  fechaNacimiento: string;
  genero: string;
  pais: string;
  ciudad: string;
  frecuenciaContenido: string;
  usuarioInstagram: string;
  seguidoresInstagram: number;
  cuentaPublica: boolean;
  usuarioTikTok: string;
  seguidoresTikTok: number;
  sobreTi: string;
  aceptaBeneficios: string;
  aceptaTerminos: boolean;
}

export interface FoodieApplicationResponse {
  id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaAplicacion: Date;
  fechaRespuesta?: Date;
  comentarios?: string;
}