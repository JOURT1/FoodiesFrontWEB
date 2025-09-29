export interface CatalogoMaster {
  id: number;
  codigo: string;
  descripcion: string;
  estaActivo: boolean;
  detalles?: CatalogoDetalle[];
}

export interface CatalogoDetalle {
  id: number;
  codigo: string;
  nombre: string;
  estaActivo: boolean;
  orden: number;
}

export interface CatalogoMasterRequest {
  codigo: string;
  descripcion: string;
  estaActivo: boolean;
  detalles?: CatalogoDetalleRequest[];
}

export interface CatalogoDetalleRequest {
  codigo: string;
  nombre: string;
  estaActivo: boolean;
  orden: number;
}

