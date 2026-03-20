import {useNavigate} from "react-router-dom";
import {TextField, Dialog, Button, Select, Checkbox, FormControl, InputLabel, MenuItem, Alert, FormControlLabel, DialogTitle, DialogContent, Autocomplete, Chip, CircularProgress, RadioGroup, Radio, Typography} from "@mui/material";
import {useRef, useState, useEffect} from "react";
import { createAnuncio } from "../services/anuncioService.js";
import {searchBooksGoogle} from "../services/googleBooksService.js";
import {CreateEjemplar} from './CreateEjemplar.jsx'
import {getEjemplares} from "../services/ejemplarService.js";

export const CreateAnuncioModal = ({open, onClose, libroData}) => {

    // Calculamos la fecha de expiracion a 30 días
    const calcularFechaExpiracion = () => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 30);
        return fecha.toISOString().split('T')[0];
    }
    const navigate = useNavigate();

    // use States necesarios

    const [ejemplaresExistentes, setEjemplaresExistentes] = useState([]);
    const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState(null);
    const [loadingEjemplares, setLoadingEjemplares] = useState(false);
    const [modoEjemplar, setModoEjemplar] = useState(null);
    const [loading, setLoading] = useState(false);

    const [anuncio, setAnuncio] = useState({
        titulo_anuncio: libroData.titulo || '',
        descripcion: libroData.sinopsis || `Listing ${libroData.titulo}`,
        fecha_expiracion: calcularFechaExpiracion(),
        lugar_recogida: '',
        metodo_pago: '',
        permite_envio: false,
        precio_envio: null,
        tipo: null,
        acepta_otros: false
    })
    
    const [ejemplar, setEjemplar] = useState({
        precio: null,
        stock: null,
        condicion: null,
        descripcion_estado: '',
        estado: null,
    })

    const [error, setError] = useState(null);

    // Estados libros deseados si es intercambio
    const [librosDeseados, setLibrosDeseados] = useState([]);
    const [librosOptions, setLibrosOptions] = useState([]);
    const [loadingLibros, setLoadingLibros] = useState(false);

    // Implementacion de un timeout por limitacion de google books api
    const timeoutRef = useRef(null);

    const formatearTexto = (texto) => {
        if (!texto) return '';
        return texto.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    }

    useEffect(() => {
        if (open && libroData?.isbn) {
            setLoadingEjemplares(true);
            getEjemplares()
                .then(res => {
                    const ejemplaresDelLibro = res.data.filter(
                        ej => ej.libro_id?.isbn === libroData.isbn && ej.estado === 'disponible'
                    );
                    setEjemplaresExistentes(ejemplaresDelLibro);
                    
                    if (ejemplaresDelLibro.length > 0) {
                        setModoEjemplar('existente');
                        setEjemplarSeleccionado(ejemplaresDelLibro[0].id);
                    } else {
                        setModoEjemplar('nuevo');
                    }
                })
                .catch(err => console.error('Error loading books:', err))
                .finally(() => setLoadingEjemplares(false));
        }
    }, [open, libroData?.isbn]);

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
                console.error('Error loading books results: ', error);
                setLibrosOptions([]);
            } finally {
                setLoadingLibros(false);
            }
        }, 1000)
    }

    function handleSubmit (e) {
        // Previene el submit al cargar el formulario
        e.preventDefault();
        setError(null);

        // Evitar múltiples envíos
        if (loading) return;

        // Validaciones
        if (!anuncio.tipo) {
            setError('You must select a type (Sale or Exchange)');
            return;
        }

        if (!anuncio.titulo_anuncio || anuncio.titulo_anuncio.trim() === '') {
            setError('Book title is required');
            return;
        }

        if (modoEjemplar === 'nuevo') {
            if (!ejemplar.precio || ejemplar.precio <= 0) {
                setError('Book price is required and must greater than 0');
                return;
            }
            if (!ejemplar.condicion) {
                setError('You must select the book condition');
                return;
            }
            if (!ejemplar.estado) {
                setError('You must select the book status');
                return;
            }
        }

        if (modoEjemplar === 'existente' && !ejemplarSeleccionado) {
            setError('You must select an existing book');
            return;
        }

        if (anuncio.tipo === 'intercambio' && librosDeseados.length === 0 && !anuncio.acepta_otros) {
            setError('You must add books you accept or check that you accept other books');
            return;
        }

        const datosAnuncio = {
            ...libroData,
            ...anuncio,
            libro_deseados: librosDeseados.map(libro => ({
                isbn: libro.isbn,
                titulo: libro.titulo,
                autor: libro.autor,
                portada_url: libro.portada_url,
                sinopsis: libro.sinopsis,
                editorial: libro.editorial,
                año_publicacion: libro.año_publicacion
            }))
        };

        if (modoEjemplar === 'existente') {
            datosAnuncio.ejemplar_id = ejemplarSeleccionado;
        } else {
            Object.assign(datosAnuncio, ejemplar);
        }

        // Iniciamos el create del controller que ya coge los parametros necesarios para crear el anuncio
        setLoading(true);
        createAnuncio(datosAnuncio)
        .then(res => navigate(`/anuncios/${res.data.id}`))
        .catch(err => setError(err.response?.data?.error || err.message))
        .finally(() => setLoading(false));
    }


    // Hacemos el return con el modal y ejemplar, etc...
    // Primero le preguntamos por el ejemplar y luego le damos la opción de cambiar datos del anuncio y de rellenar lo que falte
    return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{backgroundColor: '#F3DAAF'}}>Crear Anuncio</DialogTitle>
        <DialogContent sx={{backgroundColor: '#F3DAAF'}}>

        {loadingEjemplares ? (
            <CircularProgress sx={{display: 'block', margin: '20px auto'}} />
        ) : ejemplaresExistentes.length > 0 ? (
            <>
                <FormControl component="fieldset" fullWidth margin="normal">
                    <Typography variant="subtitle1" gutterBottom>
                        Ya tienes {ejemplaresExistentes.length} ejemplar(es) de este libro
                    </Typography>
                    <RadioGroup
                        value={modoEjemplar}
                        onChange={(e) => setModoEjemplar(e.target.value)}
                    >
                        <FormControlLabel 
                            value="existente" 
                            control={<Radio />} 
                            label="Use existing book" 
                        />
                        <FormControlLabel 
                            value="nuevo" 
                            control={<Radio />} 
                            label="Create new book" 
                        />
                    </RadioGroup>
                </FormControl>

                {modoEjemplar === 'existente' && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select book</InputLabel>
                        <Select
                            value={ejemplarSeleccionado || ''}
                            onChange={(e) => setEjemplarSeleccionado(e.target.value)}
                            label="Select book"
                        >
                            {ejemplaresExistentes.map(ej => (
                                <MenuItem key={ej.id} value={ej.id}>
                                    {formatearTexto(ej.condicion)} - {ej.precio}€ - Stock: {ej.stock}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {modoEjemplar === 'nuevo' && (
                    <CreateEjemplar ejemplar={ejemplar} setEjemplar={setEjemplar}/>
                )}
            </>
        ) : (
            <CreateEjemplar ejemplar={ejemplar} setEjemplar={setEjemplar}/>
        )}

        <TextField
            name="titulo_anuncio"
            label="Listing title"
            value={anuncio.titulo_anuncio}
            onChange={(e) => setAnuncio({...anuncio, titulo_anuncio: e.target.value})}
            fullWidth
            margin="normal"
            />

        <TextField
            name="descripcion"
            label="Description"
            multiline
            value={anuncio.descripcion}
            onChange={(e) => setAnuncio({...anuncio, descripcion: e.target.value})}
            fullWidth
            margin="normal"
            />

        <TextField
            name="fechaExpiracion"
            label="Expiration date"
            type="date"
            value={anuncio.fecha_expiracion}
            onChange={(e) => setAnuncio({...anuncio, fecha_expiracion: e.target.value})}
            fullWidth
            margin="normal"
            InputLabelProps={{shrink: true}}
            />

        <FormControl fullWidth margin="normal">
        <InputLabel>Listing type</InputLabel>
        <Select
            name="tipo"
            value={anuncio.tipo}
            onChange={(e) => setAnuncio({...anuncio, tipo: e.target.value})}
            label="Listing type"
            > 
        <MenuItem value="venta">Sale</MenuItem>
        <MenuItem value="intercambio">Exchange</MenuItem>
        </Select>
        </FormControl>
        {anuncio.tipo === 'intercambio' && (
            <>
            <Autocomplete
                multiple
                options={librosOptions}
                getOptionLabel={(libro => `${libro.titulo} - ${libro.autor}`)}
                value={librosDeseados}
                onChange={(event, newValue) => {
                    setLibrosDeseados(newValue)
                }}
                onInputChange={(event, value) => {
                    buscarLibros(value);
                }}
                loading={loadingLibros}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label='Books you accept'
                    placeholder="Type to search"
                    helperText="Type at least 3 characters"
                    />
                )}
                renderTags={(value, getTagProps) => 
                    value.map((libro, index) => (
                        <Chip
                        label={libro.titulo}
                        {...getTagProps({index})}
                        key={libro.id}
                        />
                    ))
                }
                fullWidth
                sx={{mt: 2, mb: 2}}
                />
            <FormControlLabel
            control={<Checkbox
                checked={anuncio.acepta_otros}
                onChange={(e) => setAnuncio({...anuncio, acepta_otros: e.target.checked})}/>}
                label="Accept unlisted books?"
                />
            </>
        )}
        <TextField
            name="lugarRecogida"
            label="Pickup city (Optional)"
            value={anuncio.lugar_recogida}
            onChange={(e) => setAnuncio({...anuncio, lugar_recogida: e.target.value})}
            fullWidth
            margin="normal"
            />

    <FormControlLabel
        control={
            <Checkbox 
            checked={anuncio.permite_envio} 
            onChange={(e) => setAnuncio({...anuncio, permite_envio: e.target.checked})}
            />}
            label="Shipping"
            />
        <TextField
            name="metodoPago"
            label="Payment method (Optional)"
            value={anuncio.metodo_pago}
            onChange={(e) => setAnuncio({...anuncio, metodo_pago: e.target.value})}
            fullWidth
            margin="normal"
            />

        <TextField
            name="precioEnvio"
            label="Shipping cost (Optional)"
            value={anuncio.precio_envio}
            onChange={(e) => setAnuncio({...anuncio, precio_envio: e.target.value})}
            fullWidth
            margin="normal"
            />
        <Button onClick={handleSubmit} type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create listing'}
        </Button>
        {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
            </DialogContent>
    </Dialog>
}