import prisma from '../config/db.js';
import {roles} from '@prisma/client';

// Buscamos en la base de datos por el email de usuario.
export const findByEmail = async (email) => {
return await prisma.usuario.findUnique({ where: {email}});
};

// Buscamos en la base de datos por el email de usuario.
export const findByNombreUsuario = async (nombre_usuario) => {
return await prisma.usuario.findUnique({ where: {nombre_usuario}});
};

// Exportamos la función para buscar un usuario en la base de datos por su id
export const findById = async (id) => {
return await prisma.usuario.findUnique({ where: {id}});
};

export const updateUsuario = async (usuario_id, data) => {
    try {
        const user = await prisma.usuario.update({where: {id: usuario_id}, data});
        return user;
    } catch (e) {
        console.log(e);
        throw new Error('Error updating user.');
    }
}

// Creamos el usuario con un objeto data pasado
export const createUsuario = async (data) => {
    try {
        const user = await prisma.usuario.create({
            data: {
                nombre_usuario: data.nombre_usuario,
                email: data.email,
                password: data.password,
                ciudad: data.ciudad,
                provincia: data.provincia,
                direccion: data.direccion,
            }
        });
        return user
    } catch (e) {
        console.log(e);
        throw new Error('Error creating user.');
    }
}
