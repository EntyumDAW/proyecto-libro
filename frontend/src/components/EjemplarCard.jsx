import {Card, Typography, CardContent, CardActionArea, Chip, Box} from '@mui/material';
import {traducir} from '../utils/translations.js';

export const EjemplarCard = ({ejemplar, onClick}) => {
    // Card para mostrar ejemplares del usuario
    
    return (
        <Card sx={{height: 390, display: 'flex', flexDirection: 'column', width: 200}}>
            <CardActionArea onClick={onClick} sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
                <Box
                    component='img'
                    src={ejemplar.libro_id.portada_url}
                    alt={ejemplar.libro_id.titulo}
                    sx={{
                        height: 280,
                        width: '100%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        display: 'block'
                    }}
                />
                <CardContent sx={{overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2, backgroundColor: '#fae8caff'}}>
                    <Typography variant="h6" component='div' noWrap>
                        {ejemplar.libro_id.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {ejemplar.libro_id.autor}
                    </Typography>
                    <Box sx={{display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap'}}>
                        <Chip 
                            label={traducir(ejemplar.estado)} 
                            size="small"
                            color={ejemplar.estado === 'disponible' ? 'success' : 'default'}
                        />
                        <Chip 
                            label={`${ejemplar.precio}€`} 
                            size="small"
                            color="primary"
                        />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};