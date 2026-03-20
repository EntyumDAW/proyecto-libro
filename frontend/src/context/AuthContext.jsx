import {createContext, useState} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        if(userId) return {id: parseInt(userId), nombre_usuario: userName || ''}
        return null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    function register(user, token) {
        setUser(user);
        setToken(token);
        login(token, user);
    }
    function login(token, usuario) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', usuario.id);
        localStorage.setItem('userName', usuario.nombre_usuario);
        setUser(usuario);
        setIsAuthenticated(true);
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
    }
    return <AuthContext.Provider value={{user, token, login, register, logout, isAuthenticated}}>{children}</AuthContext.Provider>
}

