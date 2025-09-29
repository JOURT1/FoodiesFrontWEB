export interface Organizacion {
  idOrganizacion: number;
  identificacion: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  representante: string;
  correo: string;
  telefono: string;
  actividadEconomica: string;
  responsable: string;
  estaActivo: boolean;
  fechaCreacion?: Date;
  usuarioCreacion?: string;
  fechaModificacion?: Date;
  usuarioModificacion?: string;
}

export interface CrearOrganizacionDto {
  identificacion: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  representante: string;
  correo: string;
  telefono: string;
  actividadEconomica: string;
  responsable: string;
  estaActivo: boolean;
}

export interface EditarOrganizacionDto {
  identificacion: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  representante: string;
  correo: string;
  telefono: string;
  actividadEconomica: string;
  responsable: string;
  estaActivo: boolean;
}

export interface ConsultaOrganizacionDto {
  id?: number;
  identificacion?: string;
  razonSocial?: string;
  nombreComercial?: string;
  actividadEconomica?: string;
  responsable?: string;
  estaActivo?: boolean;
}

// DTOs para autocomplete
export interface UsuarioAutocomplete {
  idUsuario: number;
  nombre: string;
  codigoUsuario: string;
  estaActivo: boolean;
}

export interface ResponsableAutocomplete {
  codigo: string;
  nombre: string;
  id: number;
}

export interface ActividadEconomica {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ValidacionResponse {
  isValid: boolean;
  codigoUsuario?: string;
  codigoResponsable?: string;
}