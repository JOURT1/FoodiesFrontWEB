export interface CategoriaResponse {
    id: number;
    codigo: string;
    alcance: number;
    codigoCategoria: string;
    nombreCategoria: string;
    codigoSubcategoria: string;
    nombreSubcategoria: string;
    codigoFuente: string;
    nombreFuente: string;
    estaActivo: boolean;
}

export interface CategoriaRequest {
    alcance: number;
    codigoCategoria: string;
    codigoSubcategoria: string;
    codigoFuente: string;
    estaActivo: boolean;
}