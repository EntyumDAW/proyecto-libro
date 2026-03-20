import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css';
import {AuthProvider} from "./context/AuthContext.jsx";
import {Login} from "./pages/Login.jsx";
import {Register} from "./pages/Register.jsx";
import {CssBaseline} from "@mui/material";
import {BookDetail} from "./pages/BookDetail.jsx";
import {CreateBook} from "./pages/CreateBook.jsx";
import {Home} from "./pages/Home.jsx";
import {AnuncioDetail} from "./pages/AnuncioDetail.jsx";
import {Anuncios} from './pages/Anuncios.jsx';
import {MisAnuncios} from './pages/MisAnuncios.jsx';
import {Notificaciones} from "./pages/Notificaciones.jsx";
import {Header} from "./components/Header.jsx";
import {MiCuenta} from "./pages/MiCuenta.jsx";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";
import {AuthPage} from "./pages/Auth.jsx";
import {MisEjemplares} from "./pages/MisEjemplares.jsx";
import {MisTransacciones} from "./pages/MisTransacciones.jsx";
import {MisFavoritos} from "./pages/MisFavoritos.jsx";
import {Mensajes} from "./pages/Mensajes.jsx";
import {Conversacion} from "./pages/Conversacion.jsx";
import {useState} from "react";

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return(
  <div style={{ width: '100%'}}>
  <AuthProvider>
  <CssBaseline/>
    <BrowserRouter>
    <Header onSearch={handleSearch}/>
    <Routes>
    <Route path="/auth" element={<AuthPage/>}></Route>
    <Route path="/" element={<Home searchQuery={searchQuery}/>}></Route>
    <Route path="/libros/:id" element={<BookDetail/>}></Route>
    <Route path="/libros/crear-nuevo" element={<ProtectedRoute><CreateBook/></ProtectedRoute>}></Route>
    <Route path="/anuncios" element={<Anuncios/>}></Route>
    <Route path="/mis-anuncios" element={<ProtectedRoute><MisAnuncios/></ProtectedRoute>}></Route>
    <Route path="/anuncios/:id" element={<AnuncioDetail/>}></Route>
    <Route path="/notificaciones" element={<ProtectedRoute><Notificaciones/></ProtectedRoute>}></Route>
    <Route path="/mi-cuenta" element={<ProtectedRoute><MiCuenta/></ProtectedRoute>}></Route>
    <Route path="/mis-ejemplares" element={<ProtectedRoute><MisEjemplares/></ProtectedRoute>}></Route>
    <Route path="/mis-transacciones" element={<ProtectedRoute><MisTransacciones/></ProtectedRoute>}></Route>
    <Route path="/mis-favoritos" element={<ProtectedRoute><MisFavoritos/></ProtectedRoute>}></Route>
    <Route path="/mensajes" element={<ProtectedRoute><Mensajes/></ProtectedRoute>}></Route>
    <Route path="/mensajes/:id" element={<ProtectedRoute><Conversacion/></ProtectedRoute>}></Route>
    </Routes>
    </BrowserRouter>
</AuthProvider>
</div>
  )
}

export default App;