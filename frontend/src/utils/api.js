import axios from 'axios';

const axiosCr = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

axiosCr.interceptors.request.use((config)  => {
    const accessToken =  localStorage.getItem('token');
    if(accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
})

export default axiosCr;