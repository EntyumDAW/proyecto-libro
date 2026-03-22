import {CardMedia, Card, Typography, CardContent, CardActionArea, Chip} from '@mui/material';
import {useNavigate} from "react-router-dom";
import {traducir} from '../utils/translations.js';

export const AnuncioCard = ({anuncio}) => {
    // Navigate para su uso posterior
    const navigate = useNavigate();

    // Devolvemos las de los anuncios
    return (
    <Card sx={{height: 390, width: 200, display: 'flex', flexDirection: 'column'}}>
        <CardActionArea onClick={() => navigate(`/anuncios/${anuncio.id}`)}>
            <CardMedia 
                component='img'
                height='280'
                width='100%'
                image={anuncio.ejemplar_id.libro_id.portada_url}
                alt={anuncio.ejemplar_id.libro_id.titulo}/>
            <CardContent sx={{backgroundColor: '#fae8caff'}}>
                <Typography variant='h6' noWrap>{anuncio.ejemplar_id.libro_id.titulo}</Typography>
                <Typography variant='body2' color='text.secondary' noWrap>{anuncio.ejemplar_id.libro_id.autor}</Typography>
                <Chip
                    label={anuncio.tipo === 'venta' ? 'Sale' : 'Exchange'}
                    color={anuncio.tipo === 'venta' ? 'success' : 'info'}
                    size="small"
                    sx={{mt: 0.5, mr: 0.5}}
                />
                <Chip
                    label={anuncio.ejemplar_id.precio != null ? `${anuncio.ejemplar_id.precio}€` : 'No price'}
                    color={anuncio.tipo === 'venta' ? 'success' : 'info'}
                    size="small"
                    sx={{mt: 0.5}}
                />
            </CardContent>
            </CardActionArea>
    </Card>
)
}