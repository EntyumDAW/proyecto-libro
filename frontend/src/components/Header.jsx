import {useContext, useEffect, useState} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {Badge, IconButton, AppBar, Toolbar, TextField, MenuItem, Box, Button, Avatar, Menu} from '@mui/material';
import {Notifications, Person, PostAdd, ExitToApp, Chat, Favorite} from '@mui/icons-material';
import {AuthContext} from '../context/AuthContext';
import {getUnreadCount} from '../services/notificacionService';
import {getNoLeidos} from '../services/mensajeService';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTag, faUser} from '@fortawesome/free-solid-svg-icons';


export const Header = ({onSearch}) => {
    
    const navigate = useNavigate();
    const location = useLocation();
    const {user, logout} = useContext(AuthContext);

    // Estados necesarios
    const [unreadCount, setUnreadCount] = useState(0);
    const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
    const [query, setQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    // Carga y refresca periódicamente los contadores de notificaciones y mensajes no leídos
    // Así el badge se actualiza en tiempo real sin necesidad de recargar la página
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            setMensajesNoLeidos(0);
            return;
        }

        const fetchContadores = () => {
            getUnreadCount()
                .then(res => setUnreadCount(res.data.count))
                .catch(() => {});
            getNoLeidos()
                .then(res => setMensajesNoLeidos(res.data.count))
                .catch(() => {});
        };

        // Primera carga inmediata
        fetchContadores();

        // Refrescamos cada 10 segundos para simular tiempo real
        const intervalo = setInterval(fetchContadores, 10000);
        return () => clearInterval(intervalo);
    }, [user]);

    useEffect(() => {
        if (!query || query.length < 3) return;

        const timer = setTimeout(() => {
            if (location.pathname !== '/') {
                navigate('/');
            }
            if (onSearch){
                onSearch(query);
            }
        }, 800)

        return () => clearTimeout(timer);
    }, [query]);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    }

    return (
        <AppBar position="sticky" elevation={2}
            sx={{
                bgcolor: 'rgba(180, 142, 102, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', py: 0, px: {xs: 2, md:3}, height: 70}}>
                {/* Logo */}
                <Box component="a" href="/"
                    sx={{display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'transform 0.2s',
                        '&:hover': {transform: 'scale(1.05)'},
                    }}
                >
                    <img
                        src='/logo.png'
                        alt="proyectoLibro"
                        style={{width: 170, height: 170, marginRight: 12, borderRadius: 8, objectFit: 'contain'}}
                    />
                </Box>

                {/* Busqueda */}
                <Box sx={{flex: 1, maxWidth: 600, mx: {xs: 2, md: 4}}}>
                    <TextField
                        fullWidth
                        size='small'
                        placeholder='Search books...'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                                borderRadius: 3,
                                '& fieldset': {border: '1px solid #e2e8f0'},
                                '&:hover fieldset': {borderColor: 'primary.main'},
                                '&.Mui-focused fieldset': {borderColor: 'primary.main'}
                            }
                        }}
                        />
                </Box>

                <Box sx={{display: 'flex', gap: 1.5, alignItems: 'center'}}>
                {/* Anuncios - visible siempre (NO requiere login) */}
                <IconButton 
                    component={Link}
                    to="/anuncios"
                    sx={{
                        display: {xs: 'flex', sm: 'flex'}, 
                        color: '#000',
                        '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.1)'}
                    }}
                >
                    <FontAwesomeIcon icon={faTag} size="lg" />
                </IconButton>

                {/* Badge de notificaciones y mensajes - solo se muestra si el usuario esta autenticado */}
                {user ? (
                    <>
                    <IconButton
                    onClick={() => navigate('/notificaciones')}
                    sx={{display: 'flex', color: '#000', '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.1)'}}}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <Notifications/>
                        </Badge>
                    </IconButton>

                    {/* Badge de mensajes no leídos */}
                    <IconButton
                        onClick={() => navigate('/mensajes')}
                        sx={{display: 'flex', color: '#000', '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.1)'}}}
                    >
                        <Badge badgeContent={mensajesNoLeidos} color="error">
                            <Chat/>
                        </Badge>
                    </IconButton>

                        {/* Avatar con menú */}
                        <IconButton onClick={handleMenuOpen}>
                            <Avatar sx={{width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 600}}>
                                {user.nombre_usuario?.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{sx: {borderRadius: 2, mt: 1}}}
                            >
                                <MenuItem
                                    component={Link} to="/mi-cuenta"
                                    onClick={handleMenuClose}
                                    sx={{gap:1}}
                                    >
                                    <Person fontSize="small"/> My account
                                </MenuItem>
                                <MenuItem
                                    component={Link} to="/mis-ejemplares"
                                    onClick={handleMenuClose}
                                    sx={{gap: 1}}>
                                        <PostAdd fontSize='small'/> My books
                                </MenuItem>
                                <MenuItem
                                    component={Link} to="/mis-transacciones"
                                    onClick={handleMenuClose}
                                    sx={{gap: 1}}>
                                        <PostAdd fontSize='small'/> My transactions
                                </MenuItem>
                                <MenuItem
                                    component={Link} to="/mis-anuncios"
                                    onClick={handleMenuClose}
                                    sx={{gap: 1}}
                                    >
                                        <PostAdd fontSize="small"/> My listings
                                </MenuItem>
                                <MenuItem
                                    component={Link} to="/mis-favoritos"
                                    onClick={handleMenuClose}
                                    sx={{gap: 1}}
                                    >
                                        <Favorite fontSize="small"/> My favourites
                                </MenuItem>
                                <MenuItem
                                    component={Link} to="/"
                                    onClick={handleLogout}
                                    sx={{gap: 1, color: 'error.main'}}>
                                        <ExitToApp fontSize="small"/> Logout
                                </MenuItem>
                        </Menu>
                        </>
                    ) : (
                        <>
                        <Button
                            component={Link} to="/auth"
                            startIcon={<FontAwesomeIcon icon={faUser} />}
                            size="large"
                            sx={{
                                textTransform: 'none', 
                                borderRadius: 2, 
                                color: '#000',
                                '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.1)'}
                            }}
                        >
                            My account
                        </Button>
                        </>
                )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};