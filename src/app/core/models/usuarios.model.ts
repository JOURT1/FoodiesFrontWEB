export interface Usuario {
  idUsuario: number;
  nombre: string;
  codigoUsuario: string;
  estaActivo: boolean;
  fechaUltimoAcceso?: Date;
  fechaCreacion?: Date;
  fechaBloqueo?: Date;
  intentosFallidos: number;
  roles: string[];
  rol: string;
  ultimoAcceso?: Date;
}

export interface CrearUsuarioDto {
  operacion: 'crear';
  nombre: string;
  codigoUsuario: string;
  contrasenia: string;
  rolesCodigos: string[];
}

export interface EditarUsuarioDto {
  operacion: 'actualizar';
  idUsuario: number;
  nombre?: string;
  codigoUsuario?: string;
  rolesCodigos?: string[];
}

export interface CambiarPasswordDto {
  operacion: 'cambiar_contrasenia';
  idUsuario: number;
  contraseniaActual: string;
  contrasenia: string;
}

export interface OperacionUsuarioDto {
  operacion: 'activar' | 'desactivar' | 'bloquear' | 'desbloquear';
  idUsuario: number;
}

export interface RespuestaUsuarios {
  usuarios?: Usuario[];
  totalUsuarios?: number;
  fechaConsulta?: Date;
}
