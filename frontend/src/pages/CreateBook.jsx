import {useState, useEffect} from "react";
import {TextField, Button, Box, Typography, Container, Alert, Select, MenuItem, InputLabel, FormControl} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {createBookManual} from "../services/bookService.js";
import {getAllCategories} from "../services/categoriaService.js";
import {PageLayout} from "../components/PageLayout.jsx";

export const CreateBook = () => {
    // Iniciamos el navigate
    const navigate = useNavigate();

    // Usestate necesarios
    const [error, setError] = useState(null);
    const [isbn, setIsbn] = useState('');
    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [sinopsis, setSinopsis] = useState('');
    const [año_publicacion, setAñoPublicacion] = useState('');
    const [editorial, setEditorial] = useState('');
    const [portada, setPortada] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);

    function handleSubmit(e) {
        // Prevenimos el inicio automatico del submit
        e.preventDefault();

        // Creamos el objeto data para pasarselo al registerFront
        const data = {titulo, autor, sinopsis, portada, isbn, año_publicacion, editorial, categorias};

        // Llamamos a createBook 
        createBookManual(data)
            .then(res => navigate(`/libros/${res.data.isbn || res.data.id}`))
            .catch(err => setError(err.message))
    }

    useEffect(() => {
        getAllCategories()
            .then(res => setCategoriasDisponibles(res.data))
            .catch(err => setError(err.message))
    }, [])
        
        // Y ahora el return con el componente de MUI
    return(
    <PageLayout>
        <Box component='form' onSubmit={handleSubmit} sx={{mt: 4, display: 'flex', flexDirection: 'column', gap: 2}}>
            <Typography variant="h4">Create new book</Typography>

            <TextField 
                onChange={e => setTitulo(e.target.value)}
                label='Title'
                value={titulo}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <TextField
                onChange={e => setAutor(e.target.value)}
                label='Author'
                value={autor}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <FormControl fullWidth required>
                <InputLabel>Genre</InputLabel>
                <Select multiple
                value={categorias}
                onChange={e => setCategorias(e.target.value)} 
                label='Genre'>
                    {categoriasDisponibles.map(cat => {
                        return <MenuItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </MenuItem>
                    })}
                </Select>
                </FormControl>

            <TextField 
                onChange={e => setIsbn(e.target.value)}
                label='ISBN'
                value={isbn}
                fullWidth
                margin="normal"
                >
                </TextField>

            <TextField 
                onChange={e => setSinopsis(e.target.value)}
                label='Synopsis'
                value={sinopsis}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <TextField 
                onChange={e => setAñoPublicacion(e.target.value)}
                label='Publication year (OPTIONAL)'
                value={año_publicacion}
                fullWidth
                margin="normal"
                >
                </TextField>

            <TextField 
                onChange={e => setEditorial(e.target.value)}
                label='Publisher'
                value={editorial}
                fullWidth
                margin="normal"
                >
                </TextField>

            <TextField 
                onChange={e => setPortada(e.target.value)}
                label='Cover'
                value={portada}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <Button type="submit" variant="contained">Create</Button>
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
        </PageLayout>
    )
}


