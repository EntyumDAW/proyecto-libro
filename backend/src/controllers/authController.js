import {createUsuario, findByEmail, findByNombreUsuario} from "../repositories/usuarioRepository.js";
import {hashPassword, comparePassword} from '../utils/bcrypt.js';
import {generateToken} from "../utils/tokenGenerator.js";
import {checkAuth} from "../middlewares/validator.js";

export const registrarUsuario = async (req, res) => {
    try {
        // Comprobamos todo con el validador
        await checkAuth(req.body.email, req.body.password, req.body.nombre_usuario);

        // Hacemos hash a la contraseña recibida por el body
        req.body.password = await hashPassword(req.body.password);

        // Si todo funciona, creamos el usuario con el body
        const user = await createUsuario(req.body);
        const token = generateToken(user.id);

        // Quitamos el password del usuario porque prisma lo devuelve entero
        const usuario = {
            id: user.id,
            nombre_usuario: user.nombre_usuario,
            email: user.email,
            ciudad: user.ciudad || '',
            provincia: user.provincia || ''
        };

        // Devolvemos el usuario y su token
        res.json({usuario, token});
    } catch (e){
        res.status(400).json({error: e.message});
    }
}

export const loginUsuario = async (req, res) => {
    try{
        // Primero buscamos si el usuario existe y si no mandamos error al usuario
        let userFound = null;
        if(req.body.email){
            userFound = await findByEmail(req.body.email);
        }
        if (!userFound && req.body.nombre_usuario){
            userFound = await findByNombreUsuario(req.body.nombre_usuario);
        }
        if (!userFound) throw new Error('Invalid credentials');

        // Comparamos la contraseña escrita y la almacenada, si no coincide se lanza error
        if(!(await comparePassword(req.body.password, userFound.password))) throw new Error('Invalid credentials');

        // Generamos el token y guardamos el usuario para devolverlo 
        const token = generateToken(userFound.id);
        const usuario = {
            id: userFound.id,
            nombre_usuario: userFound.nombre_usuario,
            email: userFound.email,
            ciudad: userFound.ciudad,
            provincia: userFound.provincia
        };

        // Devolvemos el json del usuario y el token
        res.json({usuario, token});
    } catch (e) {
        res.status(400).json({error: e.message})
    }
}