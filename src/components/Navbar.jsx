import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.jpg'; 

const Navbar = ({ usuario }) => {
  const navigate = useNavigate();
  // Estado para controlar si el menú desplegable está abierto o cerrado
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const menuRef = useRef(null);

  // Función para cerrar sesión de Supabase
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMostrarMenuUsuario(false);
    navigate('/'); 
  };

  // Función real y operativa para eliminar la cuenta de la base de datos
  const handleEliminarCuenta = async () => {
    const confirmar = window.confirm(
      "⚠️ ¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer. (Tus solicitudes enviadas no se borrarán)."
    );
    
    if (confirmar) {
      try {
        // 1. Llamamos a la función SQL que creamos en Supabase
        const { error } = await supabase.rpc('eliminar_usuario_actual');

        if (error) throw error;

        // 2. Si el borrado fue exitoso en el backend, cerramos la sesión local
        await supabase.auth.signOut();
        
        alert("✨ Tu cuenta ha sido eliminada correctamente de nuestros registros. ¡Esperamos verte pronto!");
        setMostrarMenuUsuario(false);
        navigate('/'); // Redirecciona al inicio
      } catch (error) {
        console.error("Error al eliminar la cuenta:", error.message);
        alert("Hubo un problema al intentar eliminar tu cuenta: " + error.message);
      }
    }
  };

  // Efecto para cerrar el menú si el usuario hace clic en cualquier otra parte de la pantalla <li><Link to="/nosotros" style={styles.link}>Nosotros</Link></li>
  useEffect(() => {
    const clickAfuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarMenuUsuario(false);
      }
    };
    document.addEventListener('mousedown', clickAfuera);
    return () => document.removeEventListener('mousedown', clickAfuera);
  }, []);

  const esAdmin = usuario?.app_metadata?.role === 'admin';

  return (
    <nav style={styles.navbar}>
      <div style={styles.logoContainer}>
        <Link to="/" style={styles.logoLink}>
          <img src={logo} alt="Gurubi-arte Logo" style={styles.logoImagen} />
          <span>Gurubi-arte</span>
        </Link>
      </div>
       
      <ul style={styles.navLinks}>
        <li><Link to="/" style={styles.link}>Inicio</Link></li>
        <li><Link to="/catalogo" style={styles.link}>Catálogo</Link></li>
        <li><Link to="/solicitudes" style={styles.link}>Solicitudes</Link></li>
         
        {esAdmin && (
          <li><Link to="/admin" style={styles.linkAdmin}>Administración</Link></li>
        )}
        {esAdmin && (
          <li>
            <Link to="/gestion-consultas" style={styles.stylesLinkAdminCorreccion}>Consultas Recibidas</Link>
          </li>
        )}

        <li>
          <a href="https://www.instagram.com/gurubi.arte/" target="_blank" rel="noopener noreferrer" style={styles.linkExternal}>
            Instagram
          </a>
        </li>

        {/* CONTENEDOR DINÁMICO DEL MENÚ DE TRES PUNTOS */}
        {usuario ? (
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }} ref={menuRef}>
            <span style={styles.userTag}>
              Hola, {usuario.user_metadata?.nombre_completo || usuario.email.split('@')[0]}
            </span>
            
            {/* Botón de 3 puntos */}
            <button 
              onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)} 
              style={styles.botonTresPuntos}
              title="Opciones de cuenta"
            >
              ⋮
            </button>

            {/* Menú Desplegable Flotante */}
            {mostrarMenuUsuario && (
              <div style={styles.menuDesplegable}>
                <button onClick={handleLogout} style={styles.opcionMenu}>
                  🚪 Cerrar Sesión
                </button>
                <div style={styles.separadorMenu} />
                <button onClick={handleEliminarCuenta} style={styles.opcionMenuEliminar}>
                  ⚠️ Eliminar Cuenta
                </button>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/login" style={styles.botonLogin}>Ingresar</Link></li>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', height: '70px', backgroundColor: 'rgba(70, 194, 180, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000, backdropFilter: 'blur(5px)', fontFamily: '"Comfortaa", cursive' },
  logoContainer: { paddingLeft: '40px' },
  logoLink: { fontSize: '24px', fontWeight: 'bold', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' },
  logoImagen: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' },
  navLinks: { display: 'flex', listStyle: 'none', gap: '20px', margin: 0, paddingRight: '40px', alignItems: 'center' },
  link: { fontSize: '16px', fontWeight: '500', color: 'white', textDecoration: 'none' },
  linkAdmin: { fontSize: '16px', fontWeight: 'bold', color: '#fffb00', textDecoration: 'none' },
  stylesLinkAdminCorreccion: { fontSize: '16px', fontWeight: 'bold', color: '#fffb00', textDecoration: 'none' },
  linkExternal: { fontSize: '16px', fontWeight: '500', color: '#e6f7f5', textDecoration: 'none' },
  userTag: { color: '#fff', fontSize: '14px', backgroundColor: 'rgba(0, 0, 0, 0.15)', padding: '5px 12px', borderRadius: '15px' },
  botonLogin: { backgroundColor: 'white', color: '#46C2B4', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s' },
  
  // Estilos para el Menú Desplegable
  botonTresPuntos: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '0 8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
    width: '32px',
    transition: 'background-color 0.2s',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  menuDesplegable: {
    position: 'absolute',
    top: '40px',
    right: 0,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    padding: '6px 0',
    display: 'flex',
    flexDirection: 'column',
    width: '160px',
    zIndex: 1100,
    border: '1px solid #e6f7f5'
  },
  opcionMenu: {
    background: 'none',
    border: 'none',
    padding: '10px 15px',
    textAlign: 'left',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#333',
    fontWeight: '500',
    fontFamily: 'sans-serif',
    transition: 'background-color 0.2s'
  },
  separadorMenu: {
    height: '1px',
    backgroundColor: '#eee',
    margin: '4px 0'
  },
  opcionMenuEliminar: {
    background: 'none',
    border: 'none',
    padding: '10px 15px',
    textAlign: 'left',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#ff4d4d',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    transition: 'background-color 0.2s'
  }
};

export default Navbar;