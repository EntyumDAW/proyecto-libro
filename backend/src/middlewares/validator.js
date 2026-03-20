    import {findByEmail, findByNombreUsuario} from "../repositories/usuarioRepository.js";
    
    export const checkAuth = async (email, password, nombre_usuario) => {
    // Primero comprobamos que los datos no existen y que pasan las validaciones
    const regEmail = /^[A-Za-z0-9]{1,}[@]{1}[a-zA-Z]{1,}[.]{1}[a-zA-Z]{1,}$/;
    const regNombre = /^[A-Za-z0-9]{1,}$/;
    const regPassword = /^[A-Z]{1}[a-zA-Z0-9]{1,}[@#%&()=?¿]{1,}$/;
    if (!regEmail.test(email)) throw new Error('Invalid email address');
    if (await findByEmail(email)) throw new Error('Email already registered');
    if (!regNombre.test(nombre_usuario)) throw new Error('Invalid username');
    if (await findByNombreUsuario(nombre_usuario)) throw new Error('Username already taken');
    if (!regPassword.test(password)) throw new Error('Invalid password. Use letters, numbers and @#$%&()=?¿');
    }