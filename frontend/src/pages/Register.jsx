import {useState} from "react";
import {TextField, Button, Box, Typography, Container, Alert} from '@mui/material';
import {registerFront} from '../services/authService.js';
import {useContext} from "react";
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../context/AuthContext.jsx";

export const Register = () => {
    // Iniciamos el navigate
    const navigate = useNavigate();

    // Hacemos uso del useContext
    const {register} = useContext(AuthContext);

    // Usestate necesarios
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [nombre_usuario, setNombreUsuario] = useState();
    const [error, setError] = useState();

    function handleSubmit(e) {
        // Prevenimos el inicio automatico del submit y limpiamos los errores
        e.preventDefault();
        setError(null);


        // Añadimos unas validaciones básicas

        const regEmail = /^[A-Za-z0-9]{1,}[@]{1}[a-zA-Z]{1,}[.]{1}[a-zA-Z]{1,}$/;
        const regNombre = /^[A-Za-z0-9]{1,}$/;
        const regPassword = /^[A-Z]{1}[a-zA-Z0-9]{1,}[@#%&()=?¿]{1,}$/;

        if (!regNombre.test(nombre_usuario)) {
            setError('Invalid username. Only letters and numbers.');
            return;
        }

        if (!regEmail.test(email)) {
            setError('Invalid email. Format: ejemplo@dominio.com');
            return;
        }

        if (!regPassword.test(password)) {
            setError('Invalid password. It must start with capital letter, contain letters/numbers and at least one special character at the end (@#%&()=?).')
            return;
        }

        // Creamos el objeto data para pasarselo al registerFront
        const data = {email, password, nombre_usuario};

        // Llamamos a registerFront y le pasamos todos los datos
        registerFront(data).then((response) => {register(response.data.usuario, response.data.token), navigate('/')}).catch((err) => {setError(err.response?.data?.error || err.message)});
    }
        
        // Y ahora el return con el componente de MUI
    return <Container maxWidth='sm'>
        <Box component='form' onSubmit={handleSubmit} sx={{mt: 4, display: 'flex', flexDirection: 'column', gap: 2}}>
            <Typography variant="h4">Register</Typography>

            <TextField 
                onChange={e => setNombreUsuario(e.target.value)}
                label='Username'
                value={nombre_usuario}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <TextField
                type="email" 
                onChange={e => setEmail(e.target.value)}
                label='Email'
                value={email}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <TextField 
                type="password" 
                onChange={e => setPassword(e.target.value)}
                label='Password'
                value={password}
                fullWidth
                margin="normal"
                required
                >
                </TextField>

            <Button type="submit" variant="contained">Register</Button>
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
    </Container>
}

