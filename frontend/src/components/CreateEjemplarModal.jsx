import {useNavigate} from "react-router-dom";
import {TextField, Dialog, Button, Select, FormControl, InputLabel, MenuItem, Alert, DialogTitle, DialogContent, Autocomplete} from "@mui/material";
import {useState, useRef} from "react";
import {createEjemplar} from "../services/ejemplarService.js";
import {searchBooksGoogle} from "../services/googleBooksService.js";

export const CreateEjemplarModal = ({open, onClose, onSuccess}) => {
    
    const navigate = useNavigate();

    // Estados necesarios
    const [ejemplar, setEjemplar] = useState({
        precio: '',
        stock: 1,
        condicion: '',
        descripcion_estado: '',
        estado: 'disponible'
    });

    const [libroSeleccionado, setLibroSeleccionado] = useState(null);
    const [librosOptions, setLibrosOptions] = useState([]);
    const [loadingLibros, setLoadingLibros] = useState(false);
    const [error, setError] = useState(null);

    // Implementacion de un timeout por limitacion de google books api
    const timeoutRef = useRef(null);

    // Buscamos los libros que escribe el usuario
    const buscarLibros = async (query) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (!query || query.length < 3){
            setLibrosOptions([]);
            return;
        }

        timeoutRef.current = setTimeout(async () => {
            setLoadingLibros(true);
            try {
                const libros = await searchBooksGoogle(query);
                setLibrosOptions(libros || []);
            } catch (error) {
                console.error('Error buscando libros: ', error);
                setLibrosOptions([]);
            } finally {
                setLoadingLibros(false);
            }
        }, 1000);
    };

    // Manejador de cambios en los campos
    const handleChange = (e) => {
        setEjemplar({
            ...ejemplar,
            [e.target.name]: e.target.value
        });
    };

    // Manejador del submit
    const handleSubmit = async (e) => {
        // Previene el submit por defecto
        e.preventDefault();
        setError(null);

        if (!libroSeleccionado) {
            setError('You must select a book');
            return;
        }

        if (!ejemplar.precio || ejemplar.precio <= 0) {
            setError('Book price is required and must be greater than 0');
            return;
        }

        if (!ejemplar.condicion) {
            setError("You must select the book's condition");
            return;
        }

        if (!ejemplar.estado) {
            setError("You must select the book's status");
            return;
        }

        if (!ejemplar.stock || ejemplar.stock < 1) {
            setError('Stock must be at least 1');
            return;
        }

        try {
            // Creamos el ejemplar con los datos del libro seleccionado
            await createEjemplar({
                ...libroSeleccionado,
                ...ejemplar,
                precio: parseInt(ejemplar.precio),
                stock: parseInt(ejemplar.stock)
            });
            
            // Llamamos al callback de éxito y cerramos el modal
            onSuccess?.();
            onClose();
            
            // Reseteamos el formulario
            setEjemplar({
                precio: '',
                stock: 1,
                condicion: '',
                descripcion_estado: '',
                estado: 'disponible'
            });
            setLibroSeleccionado(null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{backgroundColor: '#F3DAAF'}}>Add book</DialogTitle>
            <DialogContent sx={{backgroundColor: '#F3DAAF', pt: 2}}>
                
                {/* Autocomplete para buscar libro */}
                <Autocomplete
                    options={librosOptions}
                    getOptionLabel={(libro) => `${libro.titulo} - ${libro.autor}`}
                    value={libroSeleccionado}
                    onChange={(event, newValue) => {
                        setLibroSeleccionado(newValue);
                    }}
                    onInputChange={(event, value) => {
                        buscarLibros(value);
                    }}
                    loading={loadingLibros}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label='Search book'
                            placeholder="Type to search"
                            helperText="Type at least 3 characters"
                            margin="normal"
                        />
                    )}
                    fullWidth
                />

                {/* Precio */}
                <TextField
                    name="precio"
                    label="Price (€)"
                    type="number"
                    value={ejemplar.precio}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />

                {/* Stock */}
                <TextField
                    name="stock"
                    label="Stock"
                    type="number"
                    value={ejemplar.stock}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />

                {/* Condición */}
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Condition</InputLabel>
                    <Select
                        name="condicion"
                        label="Condition"
                        value={ejemplar.condicion}
                        onChange={handleChange}
                    > 
                        <MenuItem value="nuevo">New</MenuItem>
                        <MenuItem value="como_nuevo">Like new</MenuItem>
                        <MenuItem value="buen_estado">Good</MenuItem>
                        <MenuItem value="regular">Fair</MenuItem>
                    </Select>
                </FormControl>

                {/* Estado */}
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="estado"
                        value={ejemplar.estado}
                        onChange={handleChange}
                        label="Status"
                    > 
                        <MenuItem value="disponible">Available</MenuItem>
                        <MenuItem value="reservado">Reserved</MenuItem>
                        <MenuItem value="vendido">Sold</MenuItem>
                        <MenuItem value="intercambiado">Exchanged</MenuItem>
                    </Select>
                </FormControl>

                {/* Descripción del estado */}
                <TextField
                    name="descripcion_estado"
                    label="Condition details"
                    multiline
                    rows={3}
                    value={ejemplar.descripcion_estado}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />

                {/* Botón crear */}
                <Button 
                    onClick={handleSubmit} 
                    type="submit" 
                    variant="contained"
                    fullWidth
                    sx={{mt: 2}}
                >
                    Add book
                </Button>

                {/* Mostrar errores */}
                {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
            </DialogContent>
        </Dialog>
    );
};