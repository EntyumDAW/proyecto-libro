import prisma from "../config/db.js";

export const findByAnuncio = async (anuncio_id) => {
    return await prisma.transacciones.findMany({
        where: {anuncio: anuncio_id}, 
        include: {
        solicitante_id: true,
        oferente_id: true,
        ejemplar_solicita: {include: {libro_id: true}},
        ejemplar_ofrece: {include: {libro_id: true}},
    }
    });
}

export const findById = async (id) => {
    return await prisma.transacciones.findUnique({
        where: {id}, 
        include: {
        solicitante_id: true,
        oferente_id: true,
        ejemplar_solicita: {include: {libro_id: true}},
        ejemplar_ofrece: {include: {libro_id: true}},
    }
    });
}

// Metodo para encontrar transacciones dado un ejemplar
export const findByEjemplar = async (ejemplar_id) => {
    return await prisma.transacciones.findMany({
        where: {
            OR: [
                {ejemplar_solicitado: ejemplar_id},
                {ejemplar_ofrecido: ejemplar_id}
            ]
        }
    })
}

// Método para encontrar transacciones de un usuario (como oferente o solicitante)
export const findByUsuario = async (usuario_id) => {
    return await prisma.transacciones.findMany({
        where: {
            OR: [
                {oferente: usuario_id},
                {solicitante: usuario_id}
            ]
        },
        include: {
            solicitante_id: true,
            oferente_id: true,
            ejemplar_solicita: {include: {libro_id: true}},
            ejemplar_ofrece: {include: {libro_id: true}},
            anuncio_id: true
        },
        orderBy: {
            fecha_creacion: 'desc'
        }
    });
}

export const create = async (data) => {
    try {
        return await prisma.transacciones.create({data});
    } catch (error) {
        throw error;
    }
}

// Actualiza solo el estado de una transacción
export const update = async (id, estado) => {
    try {
        return await prisma.transacciones.update({where: {id}, data: {estado: estado}})
    } catch (error) {
        throw error;
    }
}

// Actualiza un objeto de campos arbitrarios (usado para confirmaciones parciales)
export const updateData = async (id, data) => {
    try {
        return await prisma.transacciones.update({where: {id}, data})
    } catch (error) {
        throw error;
    }
}
