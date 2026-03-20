import {useEffect, useState} from 'react';
import {Grid, Tabs, Tab, Box, TextField, Button, Alert, CircularProgress} from '@mui/material';
import {getProfile, updateProfile, changePassword} from '../services/usuarioService.js';
import {PageLayout} from '../components/PageLayout.jsx';
export const MiCuenta = () => {
    // estados necesarios de perfil
    const [usuario, setUsuario] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // estados para cambio de contraseña
    const [passwordForm, setPasswordForm] = useState({oldPassword: '', newPassword: '', confirmPassword: ''});
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    // estado para tabs del perfil
    const [tabActual, setTabActual] = useState(0);


    useEffect(() => {
        // Llamamos y obtenemos el perfil del usuario
        setLoading(true);
        getProfile()
            .then(res => setUsuario(res.data))
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleUpdateProfile = async () => {
        // validamos los campos obligatorios
        try {
            setError(null);
            setSuccess(null);

            if (usuario.nombre_usuario && usuario.nombre_usuario.length < 3) {
                setError('Username must be at least 3 characters');
                return;
            }

            if (usuario.telefono && !/^[0-9]{9}$/.test(usuario.telefono)) {
                setError('Phone number must be at least 9 numbers');
                return;
            }

            if (usuario.codigo_postal && !/^[0-9]{5}$/.test(usuario.codigo_postal)) {
                setError('Postal code must be at leat 5 numbers');
                return;
            }

            if (usuario.dni && !/^[0-9]{8}[A-Za-z]$/.test(usuario.dni)) {
                setError('DNI must be at least 8 numebrs and 1 letter');
                return;
            }

            await updateProfile(usuario);
            setSuccess('Profile updated succesfully');

            const res = await getProfile();
            setUsuario(res.data);
            // Timer para recargar la página
            setTimeout(() => {
                window.location.reload();
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setTimeout(() => setError(null), 4000);
        }
    }

    const handleChangePassword = async () => {
    try {
        setPasswordError(null);
        setPasswordSuccess(null);
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Password do not match');
            return;
        }

        const regPassword = /^[A-Z]{1}[a-zA-Z0-9]{1,}[@#%&()=?¿]{1,}$/;
        if (!regPassword.test(passwordForm.newPassword)) {
            setPasswordError('Password must start with a capital letter, contain letters and numbers, and end with a special character (@#%&()=?)');
            return;
        }
        
        await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
        setPasswordSuccess('Password updated');
        setPasswordForm({oldPassword: '', newPassword: '', confirmPassword: ''});
        setTimeout(() => {
                window.location.reload();
            }, 2000)
    } catch (err) {
        setPasswordError(err.response?.data?.error || err.message);
        setTimeout(() => setPasswordError(null), 4000);
    }
}
    if (loading) return <CircularProgress/>
    return (
        <PageLayout>
            <Box sx={{
                maxWidth: '1200px',
                width: '1000px',
                mx: 'auto',
                height: '600px'
            }}>
            <Tabs value={tabActual} onChange={(e, newValue) => setTabActual(newValue)}>
                <Tab label='Profile'/>
                <Tab label='Security'/>
            </Tabs>
            {tabActual === 0 && (
                <Box sx={{p: 3}}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.nombre_usuario} onChange={(e) => setUsuario({...usuario, nombre_usuario: e.target.value})} label='Username'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.email} disabled label='Email'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.direccion} onChange={(e) => setUsuario({...usuario, direccion: e.target.value})} label='Address'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.ciudad} onChange={(e) => setUsuario({...usuario, ciudad: e.target.value})} label='City'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.provincia} onChange={(e) => setUsuario({...usuario, provincia: e.target.value})} label='Region'></TextField>
                    </Grid>
                    <Grid item xs={6}>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" type='number' value={usuario.codigo_postal} onChange={(e) => setUsuario({...usuario, codigo_postal: e.target.value})} label='Postal code'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.telefono} onChange={(e) => setUsuario({...usuario, telefono: e.target.value})} label='Phone'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.dni} onChange={(e) => setUsuario({...usuario, dni: e.target.value})} label='DNI'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" value={usuario.avatar_url} onChange={(e) => setUsuario({...usuario, avatar_url: e.target.value})} label='URL Avatar'></TextField>
                    </Grid>
                </Grid>
                <Button variant='contained' onClick={handleUpdateProfile}>Save changes</Button>
                {success && <Alert sx={{width: 300, mt: 2}} severity='success'>{success}</Alert>}
                {error && <Alert sx={{mt: 2}} severity='error'>{error}</Alert>}
                </Box>
            )}
            {tabActual === 1 && (
                <Box sx={{p: 3}}>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" type='password' value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} label='Current Password'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" type='password' value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} label='New Password'></TextField>
                <TextField sx={{pr: 3, mb: 3, width: '400px'}} margin="normal" type='password' value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} label='Confirm new password'></TextField>
                <Button sx={{mt: 3}} variant='contained' onClick={handleChangePassword}>Save Password</Button>
                {success && <Alert sx={{width: 300, mt: 2}} severity='success'>{success}</Alert>}
                {passwordSuccess && <Alert sx={{mt: 2}} severity='success'>{passwordSuccess}</Alert>}
                {passwordError && <Alert sx={{mt: 2}} severity='error'>{passwordError}</Alert>}
                </Box>
            )}
            </Box>
        </PageLayout>
    )
}