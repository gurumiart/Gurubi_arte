import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [esRegistro, setEsRegistro] = useState(false); // Alterna entre login y registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Solo para el registro
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState(''); // 🌟 Estado para manejar mensajes de error

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMensaje(''); // Limpiamos errores previos al intentar de nuevo

    try {
      if (esRegistro) {
        // --- PROCESO DE REGISTRO ---
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            // Guardamos el nombre en los metadatos públicos del usuario
            data: { nombre_completo: nombre }
          }
        });
        if (error) throw error;
        alert("¡Registro exitoso! Si configuraste confirmación por correo, revisa tu bandeja de entrada.");
        setEsRegistro(false);
      } else {
        // --- PROCESO DE INICIO DE SESIÓN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) throw error;
        
        // Redirección inteligente: Si es admin va a /admin, si no al inicio
        const elRol = data.user?.app_metadata?.role;
        if (elRol === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Error capturado de Supabase:", error.message);

      // 🔍 Interceptamos y traducimos de manera amigable
      if (error.message === "Invalid login credentials") {
        setErrorMensaje("❌ El correo o la contraseña son incorrectos. Por favor, verifícalos.");
      } else if (error.message === "Email not confirmed") {
        setErrorMensaje("📧 Por favor, confirma tu correo electrónico en tu bandeja de entrada antes de ingresar.");
      } else {
        setErrorMensaje(`⚠️ Ocurrió un problema: ${error.message}`);
      }
    } finally {
      setCargando(false);
    }
  };

  // Función auxiliar para limpiar estados si el usuario cambia entre Login y Registro
  const cambiarModo = () => {
    setEsRegistro(!esRegistro);
    setErrorMensaje('');
    setEmail('');
    setPassword('');
    setNombre('');
  };

  return (
    <div style={styles.contenedor}>
      <div style={styles.tarjeta}>
        <h2 style={styles.titulo}>{esRegistro ? 'Crear Cuenta' : 'Ingresar'}</h2>
        
        {/* 🌟 Contenedor visual del error (Solo aparece si 'errorMensaje' tiene texto) */}
        {errorMensaje && (
          <div style={styles.alertaError}>
            {errorMensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.formulario}>
          {esRegistro && (
            <input 
              type="text" 
              placeholder="Tu Nombre Completo" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              style={styles.input}
            />
          )}
          
          <input 
            type="email" 
            placeholder="Correo Electrónico" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
          />
          
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />

          <button type="submit" disabled={cargando} style={styles.boton}>
            {cargando ? 'Procesando...' : esRegistro ? 'Registrarme' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={styles.switchTexto}>
          {esRegistro ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta aún?'}
          <span onClick={cambiarModo} style={styles.switchLink}>
            {esRegistro ? ' Inicia Sesión aquí' : ' Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  contenedor: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '20px'
  },
  tarjeta: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    border: '1px solid #ffe3ec'
  },
  titulo: {
    fontFamily: '"Comfortaa", cursive',
    color: '#333',
    marginBottom: '25px'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none'
  },
  boton: {
    backgroundColor: '#ff8aae',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  switchTexto: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666'
  },
  switchLink: {
    color: '#ff8aae',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  // 🌟 Nuevos estilos añadidos para la alerta integrada
  alertaError: {
    backgroundColor: '#fde8ec',
    color: '#e0315a',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'left',
    marginBottom: '20px',
    border: '1px solid #fbc9d3',
    lineHeight: '1.4',
    fontWeight: '500'
  }
};

export default Login;