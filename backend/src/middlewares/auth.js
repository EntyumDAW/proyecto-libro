import jsonwebtoken from 'jsonwebtoken';
import { findById } from '../repositories/usuarioRepository.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token) return res.status(401).json('No autorizado');

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const usuario = await findById(decoded.id);
        if(!usuario) return res.status(401).json('Usuario no encontrado');
        req.user = usuario;
        next();
    } catch (error) {
        return res.status(401).json({error: error.message});
    }
}