import { librosCache } from '../utils/cache.js';
import axiosCr from "../utils/api"

export const searchBooksGoogle = async (query) => {
    if (!query) throw new Error('Query requerido');

    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = librosCache.get(cacheKey);
    if (cached) return cached;

    const res = await axiosCr.get(`/libros/search?q=${query}`);
    const librosUnicos = res.data;

    librosCache.set(cacheKey, librosUnicos);
    return librosUnicos;
}