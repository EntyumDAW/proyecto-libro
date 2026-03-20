import jwt from 'jsonwebtoken';
import {envJWT} from '../config/env.js';

export const generateToken = (usuario_id) => {
    return jwt.sign({id: usuario_id}, envJWT, {expiresIn: '7d'})
}