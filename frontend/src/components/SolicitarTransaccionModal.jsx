import { useEffect, useState } from "react"
import {getEjemplares} from '../services/ejemplarService.js'
import {createTransaccion} from "../services/transaccionService.js";
import {DialogActions, DialogContent, DialogTitle, FormControl, Typography, Dialog, Container, Box, Button, Alert, Select, MenuItem, InputLabel} from '@mui/material';

export const SolicitarTransaccionModal = ({open, onClose, anuncio}) => {

    const [ejemplarOfrecido, setEjemplarOfrecido] = useState(null);
    const [misEjemplares, setMisEjemplares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEjemplares = async () => {
            if (anuncio.tipo === 'intercambio') {
                setLoading(true);
                const res = await getEjemplares();
                const filtrados = res.data.filter(ejemplar =>{
                    const libroEnLista = anuncio.intercambio_deseado.some(
                        ic => ic.libro_deseado === ejemplar.libro
                    );
                    return (libroEnLista || anuncio.acepta_otros) && ejemplar.estado === 'disponible'
                });
                setMisEjemplares(filtrados);
                setLoading(false);
            }
        };
        loadEjemplares();
    }, [anuncio.tipo]);

    function handleSolicitar(e) {

        e.preventDefault();
        setError(null);

        let data = {anuncio_id: anuncio.id}

        if (anuncio.tipo === 'intercambio') {
            if (!ejemplarOfrecido) {
                setError('You must select a book to offer');
                return;
            }
            data = {...data, ejemplar_ofrecido_id: ejemplarOfrecido};
        }

        createTransaccion(data)
            .then(res => { console.log('Request sent successfully');
                 onClose();
                 window.location.reload();})
            .catch(err => setError(err.response?.data?.error || err.message));
    
}

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{backgroundColor: '#F3DAAE'}}>Request transaction</DialogTitle>
        <DialogContent sx={{backgroundColor: '#F3DAAE'}}>
            {anuncio.tipo === 'venta' && (
                <Container>
                <Box
                    component='img'
                    src={anuncio.ejemplar_id.libro_id.portada_url}
                    alt={anuncio.ejemplar_id.libro_id.titulo}
                    sx={{
                        height: 280,
                        width: '100%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        display: 'block'
                    }}
                    />
                <Typography variant="h6">Price: {anuncio.ejemplar_id.precio}€</Typography>
                <Typography variant="body1">{anuncio.descripcion}</Typography>
                <Button onClick={handleSolicitar} type="submit" variant="contained">Confirm purchase</Button>
                {error && <Alert severity="error">{error}</Alert>}
                </Container>
            )}

            {anuncio.tipo === 'intercambio' && (
                <Container>
                <Box
                    component='img'
                    src={anuncio.ejemplar_id.libro_id.portada_url}
                    alt={anuncio.ejemplar_id.libro_id.titulo}
                    sx={{
                        height: 280,
                        width: '100%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        display: 'block'
                    }}
                    />
                <Typography variant="body1">{anuncio.descripcion}€</Typography>
                <Typography variant="body1">Accepted books:</Typography>
                {anuncio.intercambio_deseado.map(ic => (
                    <Typography key={ic.libro_deseado}>{ic.libro.titulo}</Typography>
                ))}
                <FormControl fullWidth sx={{mt: 2}}>
                    <InputLabel>Choose your book</InputLabel>
                    <Select 
                    label='Choose your book'
                    value={ejemplarOfrecido || ''}
                    onChange={(e) => setEjemplarOfrecido(e.target.value)}
                    >
                        {misEjemplares.map(
                        ejemplar => (
                            <MenuItem key={ejemplar.id} value={ejemplar.id}>{ejemplar.libro_id.titulo}</MenuItem>
                        )
                    )}</Select>
                </FormControl>
                <Button sx={{mt: 2}} onClick={handleSolicitar} type="submit" variant="contained" disabled={!ejemplarOfrecido}>Request exchange</Button>
                {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
                </Container>
            )}

            {anuncio.tipo === 'peticion' && (
                <Container>
                    <Typography>You are offering your book</Typography>
                    <Button onClick={handleSolicitar} type="submit" variant="contained">Offer book</Button>
                    {error && <Alert severity="error">{error}</Alert>}  
                </Container>
            )}
        </DialogContent>
        <DialogActions sx={{backgroundColor: '#F3DAAE'}}>
            <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
        </Dialog>
    )
}