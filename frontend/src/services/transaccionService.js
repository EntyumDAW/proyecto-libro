import axiosCr from "../utils/api";

// Aceptar transaccion
export const aceptarTransaccion = (id) => {
    return axiosCr.put(`/transacciones/${id}/aceptar`);
}


// Cancelamos una transaccion
export const cancelarTransaccion = (id) => {
    return axiosCr.put(`/transacciones/${id}/cancelar`);
}

// Completamos la transaccion
export const completarTransaccion = (id) => {
    return axiosCr.put(`/transacciones/${id}/completar`)
}

// Crea transaccion con data
export const createTransaccion = (data) => {
    return axiosCr.post('/transacciones', data);
}

// Obtener transacciones del usuario
export const getMisTransacciones = () => {
    return axiosCr.get('/transacciones/mis-transacciones');
}
