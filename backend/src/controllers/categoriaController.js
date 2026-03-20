import {findAll, create} from "../repositories/categoriaRepository.js";

export const findAllCategories = async (req, res) => {
    try {
        // Buscamos con el metodo del repositorio todas las categorias.
        const categorias = await findAll();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const createCategoria = async (req, res) => {
    try {
        // Primero comprobamos que los obligatorios vengan
        if(!req.body.nombre) throw new Error('Revisa los campos obligatorios');
        // Ahora directamente mapeamos en base a la base de datos
        const categoria = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion || null,
            categoria_padre: req.body.categoria_padre || null
        }
        const categoriaCreada = await create(categoria)
        res.status(200).json(categoriaCreada);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}