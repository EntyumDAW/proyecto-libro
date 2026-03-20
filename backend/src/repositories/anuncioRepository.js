import prisma from "../config/db.js";

// Método para listar todos los anuncios, conteniendo cualquier palabra (referente a autor, género, etc...)
export const findAll = async (filtros) => {

    const where = {};
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.search) {
        where.ejemplar_id = {
            libro_id: {
                OR: [
                    {titulo: {contains: filtros.search, mode: 'insensitive'}},
                    {autor: {contains: filtros.search, mode: 'insensitive'}}
                ]
            }
        }
    }
    // Filtro por ISBN del libro (para "ver anuncios" desde BookDetail)
    if (filtros.isbn) {
        where.ejemplar_id = {
            libro_id: { isbn: filtros.isbn }
        }
    }

    return await prisma.anuncio.findMany({
        where,
        include: {
            ejemplar_id: {include: {libro_id: true}},
            usuario_id: true
        }
    })
}

// Método para encontrar anuncios por un id propio de la página o por isbn
export const findById = async (id) => {
    return await prisma.anuncio.findUnique({
        where: {id}, 
        include: {
        ejemplar_id: {include: {libro_id: true}},
        usuario_id: true,
        intercambio_deseado: {include: {libro: true}},
        transacciones: {
            include: {
                solicitante_id: true,
                oferente_id: true,
                ejemplar_solicita: {
                    include: {libro_id: true}
                },
                ejemplar_ofrece: {
                    include: {libro_id:true}
                }
            }
        }
    }
    });
}
// Método para encontrar anuncios por ejemplar
export const findByEjemplarId = async (ejemplar_id) => {
    return await prisma.anuncio.findMany({where: {ejemplar: ejemplar_id}});
}

// Método para encontrar los anuncios dado un usuario
export const findByUsuario = async (usuario_id) => {
    return await prisma.anuncio.findMany({where: {usuario: usuario_id}, include: {ejemplar_id: {include: {libro_id: true}}}})
}


// Método para crear un anuncio
export const create = async (data) => {
    try {
        return await prisma.anuncio.create({data});
    } catch (error) {
        throw error; 
    }
}

// Método para actualizar cualquier parámetro de un anuncio
export const update = async (id, data) => {
    try {
        return await prisma.anuncio.update({where: {id}, data});
    } catch (error) {
        throw error;
    }
}

export const deleteAnuncio = async (id) => {
    try {
        return await prisma.anuncio.delete({where: {id}});
    } catch (error) {
        throw error;
    }
}