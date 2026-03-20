import express from 'express';
import {getProfile, updateProfile, changePassword} from '../controllers/usuarioController.js';
import {auth} from '../middlewares/auth.js';

// Primero se inicia el router
const router = express.Router();


// Ruta get perfil usuario
router.get('/',auth, getProfile);

// Ruta actualizar perfil
router.put('/actualizar-perfil', auth, updateProfile);

// Ruta cambiar contraseña
router.put('/cambiar-password',auth, changePassword);


export default router;