import {TransaccionCard} from "../components/TransaccionCard.jsx";
import {useEffect, useState, useContext} from "react";
import {getMisTransacciones} from "../services/transaccionService.js";
import {Grid, Alert, Typography, Box, Pagination, useMediaQuery, useTheme, Button} from "@mui/material";
import {PageLayout} from "../components/PageLayout.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

export const MisTransacciones = () => {

    const {user} = useContext(AuthContext);
    const [transacciones, setTransacciones] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [filtroEstado, setFiltroEstado] = useState('todas');

    // Responsive - igual que MisAnuncios
    const theme = useTheme();
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    const transaccionesPorPagina = isXl ? 12 : isLg ? 8 : isMd ? 6 : isSm ? 4 : 3;

    // Cargar transacciones
    useEffect(() => {
        getMisTransacciones()
            .then(res => setTransacciones(res.data))
            .catch(err => setError(err.response?.data?.error || err.message));
    }, []);

    // Filtrar transacciones
    const transaccionesFiltradas = transacciones.filter(t => 
        filtroEstado === 'todas' || t.estado === filtroEstado
    );

    // Calcular transacciones a mostrar
    const indexUltimaTransaccion = page * transaccionesPorPagina;
    const indexPrimeraTransaccion = indexUltimaTransaccion - transaccionesPorPagina;
    const transaccionesActuales = transaccionesFiltradas.slice(indexPrimeraTransaccion, indexUltimaTransaccion);
    const totalPaginas = Math.ceil(transaccionesFiltradas.length / transaccionesPorPagina);

    return (
        <PageLayout>
            <Box sx={{maxWidth: '1600px', mx: 'auto', width: '100%'}}>
                {/* Título */}
                <Typography variant="h4" sx={{my: 4, textAlign: 'center'}}>
                    Transactions
                </Typography>

                {/* Filtros */}
                <Box sx={{mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                    <Button 
                        variant={filtroEstado === 'todas' ? 'contained' : 'outlined'}
                        onClick={() => {setFiltroEstado('todas'); setPage(1);}}
                    >
                        All
                    </Button>
                    <Button 
                        variant={filtroEstado === 'pendiente' ? 'contained' : 'outlined'}
                        onClick={() => {setFiltroEstado('pendiente'); setPage(1);}}
                    >
                        Pending
                    </Button>
                    <Button 
                        variant={filtroEstado === 'aceptada' ? 'contained' : 'outlined'}
                        onClick={() => {setFiltroEstado('aceptada'); setPage(1);}}
                    >
                        Accepted
                    </Button>
                    <Button 
                        variant={filtroEstado === 'completada' ? 'contained' : 'outlined'}
                        onClick={() => {setFiltroEstado('completada'); setPage(1);}}
                    >
                        Complete
                    </Button>
                </Box>

                {/* Grid de transacciones */}
                <Grid container spacing={3}>
                    {transaccionesActuales.map(transaccion => (
                        <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3} 
                            xl={2.4} 
                            key={transaccion.id}
                        >
                            <TransaccionCard transaccion={transaccion} usuarioId={user.id} />
                        </Grid>
                    ))}
                </Grid>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 6, mb: 4}}>
                        <Pagination
                            count={totalPaginas}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}

                {/* Mensaje si no hay transacciones */}
                {transaccionesFiltradas.length === 0 && !error && (
                    <Alert severity="info" sx={{mt: 3, width: 400}}>
                        No transactions {filtroEstado === 'todas' ? '' : filtroEstado + 's'}.
                    </Alert>
                )}

                {/* Error */}
                {error && <Alert severity="error" sx={{mt: 3}}>{error}</Alert>}
            </Box>
        </PageLayout>
    );
};