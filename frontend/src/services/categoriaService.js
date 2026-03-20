import axiosCr from "../utils/api"

export const getAllCategories = () => {
    return axiosCr.get('/categorias');
}