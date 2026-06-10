import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [verificado, setVerificado] = useState(false); // 🌟 Para saber cuando Supabase ya respondió si hay sesión o no

  const cargarHistorialUsuario = async () => {
    try {
      setCargando(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;
      
      if (!user) {
        setCorreoUsuario('');
        setSolicitudes([]);
        return;
      }

      setCorreoUsuario(user.email);

      // Traemos las consultas filtradas por el email del usuario logueado
      const { data, error: dbError } = await supabase
        .from('consultas') 
        .select('*')
        .eq('cliente_email', user.email)
        .order('creado_en', { ascending: false });

      if (dbError) throw dbError;
      setSolicitudes(data || []);

    } catch (error) {
      console.error("Error al cargar las solicitudes:", error.message);
    } finally {
      setCargando(false);
      setVerificado(true); // 🌟 Validación de sesión completada
    }
  };

  useEffect(() => {
    cargarHistorialUsuario();
  }, []);

  const obtenerEstiloEstado = (estado) => {
    const est = String(estado).toLowerCase();
    if (est === 'pendiente') return { backgroundColor: '#fff3cd', color: '#856404' };
    if (est === 'en proceso') return { backgroundColor: '#cce5ff', color: '#004085' };
    if (est === 'completado' || est === 'resuelto' || est === 'listo') return { backgroundColor: '#d4edda', color: '#155724' };
    return { backgroundColor: '#e2e3e5', color: '#383d41' };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>Mis Solicitudes 💌</h2>
      <p style={styles.subtitle}>
        {correoUsuario ? `Historial de pedidos para: ${correoUsuario}` : 'Revisa el estado de tus amigurumis personalizados'}
      </p>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {!correoUsuario && verificado ? 'Acceso Restringido 🔒' : `Tus Solicitudes Registradas (${solicitudes.length})`}
        </h3>

        {/* 🌟 NUEVA LÓGICA DE FILTRADO VISUAL INTEGRADO */}
        {!verificado ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Verificando cuenta...</p>
        ) : !correoUsuario ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <p style={{ color: '#ff4d4d', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              ⚠️ Debes iniciar sesión para poder ver tus solicitudes enviadas.
            </p>
            <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>
              Por favor, ve a la sección de ingresar para registrar tu cuenta o iniciar sesión.
            </p>
          </div>
        ) : cargando ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Cargando tu historial...</p>
        ) : solicitudes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            Aún no has realizado ninguna solicitud de amigurumi personalizado con esta cuenta.
          </p>
        ) : (
          <div style={styles.grid}>
            {solicitudes.map((sol) => (
              <div key={sol.id} style={styles.solicitudCard}>
                
                {/* Encabezado */}
                <div style={styles.solicitudHeader}>
                  <div>
                    <h4 style={styles.clienteNombre}>Usuario: {sol.nombre_cliente || 'Cliente'}</h4>
                    <span style={styles.clienteEmail}>Registrado con: {sol.cliente_email}</span>
                  </div>
                  <span style={{ ...styles.badge, ...obtenerEstiloEstado(sol.estado) }}>
                    {sol.estado || 'Pendiente'}
                  </span>
                </div>

                {/* Contenedor flexible de contenido */}
                <div style={styles.solicitudBodyLayout}>
                  
                  {/* Bloque de especificaciones en texto */}
                  <div style={styles.solicitudTextoSeccion}>
                    <p style={styles.textoLabel}>✨ Especificaciones enviadas:</p>
                    <div style={styles.contenedorEspecificaciones}>
                      <p style={styles.especificacionesText}>{sol.especificaciones}</p>
                    </div>
                  </div>

                  {/* Renderiza una o múltiples fotos juntas de manera ordenada */}
                  {sol.imagen_reference_url && (
                    <div style={styles.contenedorFotosGroup}>
                      {sol.imagen_reference_url.split(',').map((url, index) => (
                        <div key={index} style={styles.contenedorFoto}>
                          <a 
                            href={url.trim()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title={`Ver imagen de referencia ${index + 1} original`}
                          >
                            <img 
                              src={url.trim()} 
                              alt={`Referencia ${index + 1}`} 
                              style={styles.fotoMiniatura} 
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Pie de la tarjeta */}
                <div style={styles.solicitudFooter}>
                  <span style={styles.fechaText}>
                    📅 Enviada el: {sol.creado_en ? new Date(sol.creado_en).toLocaleDateString() : 'Fecha no disponible'}
                  </span>
                  {sol.imagen_reference_url && (
                    <span style={{ fontSize: '11px', color: '#ff8aae', fontWeight: 'bold' }}>
                      🔍 ({sol.imagen_reference_url.split(',').length}) Foto(s) adjunta(s)
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' },
  mainTitle: { fontFamily: '"Comfortaa", cursive', color: '#333', textAlign: 'center', margin: '0' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #ffe3ec' },
  cardTitle: { fontFamily: '"Comfortaa", cursive', marginTop: '0', marginBottom: '20px', borderBottom: '2px solid #fff0f5', paddingBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' },
  solicitudCard: { border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  solicitudHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #eee', paddingBottom: '8px' },
  clienteNombre: { margin: '0', fontSize: '15px', color: '#333', fontWeight: 'bold' },
  clienteEmail: { fontSize: '12px', color: '#777' },
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  solicitudBodyLayout: { display: 'flex', gap: '12px', flexGrow: 1, alignItems: 'center' },
  solicitudTextoSeccion: { flex: 1, display: 'flex', flexDirection: 'column' },
  contenedorEspecificaciones: { backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #f5f5f5', flexGrow: 1 },
  especificacionesText: { margin: '0', fontSize: '13px', color: '#444', lineHeight: '1.4', whiteSpace: 'pre-line' },
  textoLabel: { margin: '0 0 6px 0', fontSize: '13px', color: '#ff8aae', fontWeight: 'bold' },
  contenedorFotosGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 },
  contenedorFoto: { width: '75px', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fotoMiniatura: { width: '75px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ffe3ec', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.15s ease-in-out' },
  solicitudFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999', paddingTop: '8px', borderTop: '1px solid #f9f9f9' },
  fechaText: { fontStyle: 'italic' }
};

export default Solicitudes;