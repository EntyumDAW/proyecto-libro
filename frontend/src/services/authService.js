import axiosCr from "../utils/api";

export const registerFront = (data) => {
    // Llamamos a axios mandando la ruta, los datos y el config
    return axiosCr.post('/auth/register', data);
};

export const loginFront = (data) => {
    // Llamamos de nuevo pero esta vez para el login
    return axiosCr.post('/auth/login', data);
}