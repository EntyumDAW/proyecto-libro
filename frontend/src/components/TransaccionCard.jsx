import {Card, CardContent, Typography, Chip, Box, CardActionArea} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {traducir} from '../utils/translations.js';

export const TransaccionCard = ({transaccion, usuarioId}) => {
    // Navigate para redirigir
    const navigate = useNavigate();

    // Determinar rol del usuario
    const esOferente = usuarioId === transaccion.oferente;
    const rolTexto = esOferente ? 'Seller' : 'Buyer';
    
    // Color del estado
    const getColorEstado = (estado) => {
        switch(estado) {
            case 'pendiente': return 'warning';
            case 'aceptada': return 'info';
            case 'completada': return 'success';
            case 'rechazada': return 'error';
            case 'cancelada': return 'default';
            default: return 'default';
        }
    };
    
    return (
        <Card sx={{height: 420, display: 'flex', flexDirection: 'column', width: 200, backgroundColor: '#fae8caff'}}>
            <CardActionArea 
                onClick={() => navigate(`/anuncios/${transaccion.anuncio}`)}
                sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}
            >
                <Box
                    component='img'
                    src={transaccion.ejemplar_solicita.libro_id.portada_url}
                    alt={transaccion.ejemplar_solicita.libro_id.titulo}
                    sx={{
                        height: 280,
                        width: '100%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        display: 'block'
                    }}
                />
                <CardContent sx={{overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2}}>
                    <Typography variant="h6" component='div' noWrap>
                        {transaccion.ejemplar_solicita.libro_id.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{mb: 1}}>
                        {transaccion.ejemplar_solicita.libro_id.autor}
                    </Typography>
                    <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                        <Chip 
                            label={traducir(transaccion.estado)} 
                            size="small"
                            color={getColorEstado(transaccion.estado)}
                        />
                        <Chip 
                            label={rolTexto} 
                            size="small"
                            variant="outlined"
                        />
                        <Chip 
                            label={traducir(transaccion.tipo)} 
                            size="small"
                        />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};