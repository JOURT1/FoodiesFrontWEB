export interface NotificationRequest {
    titulo: string;
    mensaje: string;
    destinatarios: string[];
}

export interface NotificationResponse {
    id: number;
    estado: string;
    mensaje: string;
}