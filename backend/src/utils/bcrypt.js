import bcrypt from 'bcrypt';

// Primero hacemos la función para guardar la contraseña plana a hash con bcrypt 
export const hashPassword = async (password) => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
}

// Directamente con la función compare de bcrypt accede al hash guardado en la base de datos y la compara (accede al salt)
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}