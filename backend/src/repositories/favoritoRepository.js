import prisma from '../config/db.js';

// Obtener todos los favoritos de un usuario ordenados por fecha
export const findByUsuario = async (usuario_id) => {
    return await prisma.favorito.findMany({
        where: { usuario: usuario_id },
        orderBy: { fecha: 'desc' }
    });
};

// Verificar si un libro concreto ya está en favoritos del usuario
export const findByUsuarioYRef = async (usuario_id, libro_ref) => {
    return await prisma.favorito.findUnique({
        where: { usuario_libro_ref: { usuario: usuario_id, libro_ref } }
    });
};

// Añadir un nuevo favorito
export const create = async (data) => {
    return await prisma.favorito.create({ data });
};

// Eliminar un favorito por usuario y referencia del libro
export const remove = async (usuario_id, libro_ref) => {
    return await prisma.favorito.delete({
        where: { usuario_libro_ref: { usuario: usuario_id, libro_ref } }
    });
};
