import {findById, updateUsuario } from "../repositories/usuarioRepository.js"
import {hashPassword, comparePassword} from '../utils/bcrypt.js';

export const getProfile = async (req, res) => {
    try {
        // Recuperamos el usuario
        const usuario = req.user.id;
        // Buscamos el objeto usuario por el id y lo devolvemos sin la contraseña
        const usuarioData = await findById(usuario);
        const usuarioActualizado = {
                nombre_usuario: usuarioData.nombre_usuario,
                nombre: usuarioData?.nombre || null,
                direccion: usuarioData?.direccion || null,
                ciudad: usuarioData?.ciudad || null,
                provincia: usuarioData?.provincia || null,
                codigo_postal: usuarioData?.codigo_postal || null,
                telefono: usuarioData?.telefono || null,
                email: usuarioData.email,
                dni: usuarioData?.dni || null,
                rol: usuarioData.rol || 'usuario',
                avatar_url: usuarioData?.avatar_url || null,
                verificado: usuarioData?.verificado || false
    }
    res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Actualizamos el perfil del usuario
export const updateProfile = async (req, res) => {
    try {
        // Recuperamos el usuario
        const usuario = req.user.id;
        // Cogemos los datos necesarios
        const {nombre, direccion, ciudad, provincia, codigo_postal, telefono, dni, avatar_url} = req.body;
        const data = {nombre, direccion, ciudad, provincia, codigo_postal: codigo_postal ? parseInt(codigo_postal) : null, telefono, dni, avatar_url}
        // Y ahora actualizamos
        const usuarioData = await updateUsuario(usuario, data);

        // Quitamos password
        const usuarioActualizado = {
                nombre_usuario: usuarioData.nombre_usuario,
                nombre: usuarioData?.nombre || null,
                direccion: usuarioData?.direccion || null,
                ciudad: usuarioData?.ciudad || null,
                provincia: usuarioData?.provincia || null,
                codigo_postal: usuarioData?.codigo_postal || null,
                telefono: usuarioData?.telefono || null,
                email: usuarioData.email,
                dni: usuarioData?.dni || null,
                rol: usuarioData.rol || 'usuario',
                avatar_url: usuarioData?.avatar_url || null,
                verificado: usuarioData?.verificado || false
            
    }
    res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const changePassword = async (req, res) => {
    try {
        // Recuperamos usuario
        const usuario = req.user.id;
        const {oldPassword, newPassword }= req.body;

        // Recuperamos el usuario para comprobar contraseña
        const usuarioData = await findById(usuario);

        if (!(await comparePassword(oldPassword, usuarioData.password))) throw new Error('Contraseña antigua incorrecta');

        // Hasheamos la password
        const usuarioActualizado = await updateUsuario(usuario, {password: await hashPassword(newPassword)})

        // Damos confirmacion del cambio
        const mensaje = 'Contraseña cambiada correctamente';
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}