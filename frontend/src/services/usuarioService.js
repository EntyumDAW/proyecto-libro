import axiosCr from "../utils/api";

// Resctamos el perfil del usuario
export const getProfile = () => {
return axiosCr.get('/perfil');
}

//  actualizamos perfil
export const updateProfile = (data) => {
    return axiosCr.put('/perfil/actualizar-perfil', data);
    
}

// cambiar contraseña
export const changePassword = (old_password, new_password) => {
    return axiosCr.put('/perfil/cambiar-password', {oldPassword: old_password, newPassword: new_password});
}