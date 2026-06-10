import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Componentes
import Navbar from './components/Navbar';
import Inicio from './components/Inicio';
import Nosotros from './components/Nosotros';
import Catalogo from './components/Catalogo';
import Consulta from './components/Solicitudes'; 
import Login from './components/Login';
import Admin from './components/Admin';
import ListaConsultas from './components/ListaConsultas';

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // 1. Verificar si hay una sesión activa al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
    });

    // 2. Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
        
        <Navbar usuario={usuario} />

        <main style={{ paddingTop: '80px', minHeight: '80vh' }}> 
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/catalogo" element={<Catalogo usuario={usuario} />} />
            <Route path="/solicitudes" element={<Consulta />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin usuario={usuario} />} />
            <Route path="/gestion-consultas" element={<ListaConsultas />} />
          </Routes>
        </main>

        <footer style={{ textAlign: 'center', padding: '20px', backgroundColor: '#333', color: '#fff', marginTop: '40px' }}>
          <p>© 2026 Gurumi-Arte.com</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;