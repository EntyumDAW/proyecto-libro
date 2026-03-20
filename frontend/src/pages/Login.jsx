import {useState} from "react";
import {TextField, Button, Box, Typography, Container, Alert} from '@mui/material';
import {loginFront} from '../services/authService.js';
import {useContext} from "react";
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../context/AuthContext.jsx";

export const Login = () => {
    // Iniciamos el navigate
    const navigate = useNavigate();

    // Hacemos uso del useContext
    const {login} = useContext(AuthContext);

    // Usestate necesarios
    const [password, setPassword] = useState();
    const [identificador, setIdentificador] = useState();
    const [error, setError] = useState();

    function handleSubmit(e) {
        // Prevenimos el inicio automatico del submit
        e.preventDefault();
        setError(null);

        // Creamos el objeto data para pasarselo al registerFront
        const data = {email: identificador, password, nombre_usuario: identificador};

        // Llamamos a registerFront y le pasamos todos los datos
        loginFront(data).then((response) => {login(response.data.token, response.data.usuario), navigate('/')}).catch((err) => {setError(err.response?.data?.error || err.message)});
    }
        
        // Y ahora el return con el componente de MUI
    return <Container maxWidth='sm'>
        <Box component='form' onSubmit={handleSubmit} sx={{mt: 4, display: 'flex', flexDirection: 'column', gap: 2}}>
            <Typography variant="h4">Login</Typography>

            <TextField 
                onChange={e => setIdentificador(e.target.value)}
                label='Username/Email'
                value={identificador}
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

            <Button type="submit" variant="contained">Login</Button>
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
    </Container>
}

