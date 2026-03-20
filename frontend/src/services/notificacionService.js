import axiosCr from "../utils/api";

// Devuelve todas las notificaciones
export const getMisNotificaciones = () => {
    return axiosCr.get('/notificaciones');
}

// Devuelve el total no leidas
export const getUnreadCount = () => {
    return axiosCr.get('/notificaciones/no-leidas');
}

// Marca una como leida
export const markAsRead = (id) => {
    return axiosCr.put(`/notificaciones/${id}/leida`);
}

// Marca todas como leida
export const markAllRead = () => {
    return axiosCr.put('/notificaciones/todas-leidas');
}