import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
// Buscamos libros en la api de google con la query que queramos
/*export const searchBooks = async (query, maxResults, startIndex) => {
    if(!query) throw new Error('Query requerido')
    try {
        const libros = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}&startIndex=${startIndex}&projection=full&key=${API_KEY}`);
        return libros.data.items || [];
    } catch(error) {
        console.error('Error Google Api', error);
        throw error;
    }
}
    */
   export const searchBooks = async (query, maxResults, startIndex) => {
    if(!query) throw new Error('Query requerido')
    try {
        const libros = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40&startIndex=${startIndex}&projection=full&langRestrict=en&key=${API_KEY}`);
        const items = libros.data.items || [];
        const filtered = items.filter(book => {
            const lang = book.volumeInfo?.language;
            const title = book.volumeInfo?.title || '';
            const isEnglish = lang === 'en';
            const isLatinScript = /^[\x00-\x7F\s]*$/.test(title);
            return isEnglish && isLatinScript;
        });
        return filtered.slice(0, maxResults);
    } catch(error) {
        console.error('Error Google Api', error);
        throw error;
    }
}

// Filtramos por isbn
export const getBookByIsbn = async (isbn) => {
    if(!isbn) throw new Error('ISBN requerido')
    try {
        const libros = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=es&key=${API_KEY}`)
        return libros.data.items;
    } catch (error) {
        console.error('Error Google Api', error);
        throw error;
    }
}

// Filtramos por ID
export const getBookById = async (id) => {
    if(!id) throw new Error('ID requerido')
    try {
        const libros = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`)
        return libros.data;
    } catch(error) {
        console.error('Error Google Api', error);
        throw error;
    }
}