import prisma from "../config/db.js";


// Buscamos por anuncio
export const findByAnuncio = async (anuncio_id) => {
    if (!anuncio_id) throw new Error('ID de anuncio no encontrado');
    return await prisma.intercambio_deseado.findMany({where: {anuncio: anuncio_id}, include: {libro: true}});
}

// crear un intercambio deseado
export const create = async (data) => {
    if (!data) throw new Error('Revisa los campos obligatorios');
    try {
        return await prisma.intercambio_deseado.create({data});
    } catch (error) {
        throw error;
    }
}

// Método para eliminar en base a un anuncio
export const deleteByAnuncio = async (anuncio_id) => {
    if (!anuncio_id) throw new Error('ID de anuncio no encontrado');
    try {
        return await prisma.intercambio_deseado.deleteMany({where: {anuncio: anuncio_id}});
    } catch (error) {
        throw error;
    }
}