import prisma from "../config/db.js";

// Buscamos las notificaciones del usuario y las filtramos en order descendente
export const findByUsuario = async (usuario_id) => {
    if (!usuario_id) throw new Error('ID de usuario necesario');
    return await prisma.notificaciones.findMany({where: {usuario: usuario_id}, orderBy: { fecha_creacion: 'desc'}})
}

// Se crea la notificacion
export const create = async (data) => {
    try {
        if (!data) throw new Error('Error al crear la notificacion');
        return await prisma.notificaciones.create({data});
    } catch (error) {
        throw error;
    }
}

// Se marca la notificación como leida
export const markAsRead = async (id) => {
    if (!id) throw new Error('Error al marcar la notificación como leida');
    return await prisma.notificaciones.update({where: {id}, data: {leida: true}});
}

// Se marcan todas como leidas
export const markAllAsRead = async (usuario_id) => {
    if (!usuario_id) throw new Error('Error al marcar todas las notificaciones del usuario como leidas');
    return await prisma.notificaciones.updateMany({where: {usuario: usuario_id}, data: {leida: true}});
}

// Cuenta las notificaciones no leidas
export const countUnread = async (usuario_id) => {
    if (!usuario_id) throw new Error('Error al marcar todas las notificaciones del usuario como leidas');
    return await prisma.notificaciones.count({where: {usuario: usuario_id, leida: false}});

}