import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ListaConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. Cargar todas las consultas generales del negocio
  const cargarTodasLasConsultas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error("Error al obtener consultas:", error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodasLasConsultas();
  }, []);

  // 2. Función para actualizar el estado en Supabase
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const estadoFormateado = nuevoEstado.toLowerCase();

      const { data, error } = await supabase
        .from('consultas')
        .update({ estado: estadoFormateado }) 
        .eq('id', id)
        .select(); 

      if (error) {
        console.error("Error devuelto por Supabase:", error);
        alert(`Supabase rechazó el cambio: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        alert("⚠️ Supabase no arrojó error, pero ninguna fila fue modificada.\n\nVerifica si tienes las políticas RLS (Row Level Security) activadas para UPDATE en la tabla 'consultas'.");
        return;
      }

      setConsultas(prev =>
        prev.map(item => (item.id === id ? { ...item, estado: estadoFormateado } : item))
      );
      
      alert(`🎉 ¡Estado actualizado a: ${estadoFormateado}!`);

    } catch (error) {
      console.error("Error general en la aplicación:", error.message);
      alert("Ocurrió un error inesperado al procesar la solicitud.");
    }
  };

  const obtenerEstiloBadge = (estado) => {
    const est = String(estado).toLowerCase();
    if (est === 'pendiente') return { backgroundColor: '#fff3cd', color: '#856404' };
    if (est === 'en proceso') return { backgroundColor: '#cce5ff', color: '#004085' };
    if (est === 'listo' || est === 'completado' || est === 'resuelto') return { backgroundColor: '#d4edda', color: '#155724' };
    return { backgroundColor: '#e2e3e5', color: '#383d41' };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>Panel de Control: Gestión de Consultas 👑</h2>
      <p style={styles.subtitle}>Administra todas las solicitudes entrantes y actualiza su progreso</p>

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Cargando solicitudes...</p>
      ) : consultas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No hay registros de consultas en la base de datos.</p>
      ) : (
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Especificaciones / Detalles</th>
                <th style={styles.th}>Imagen Adjunta</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Estado Actual</th>
                <th style={styles.th}>Acción (Cambiar Estado)</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((item) => {
                const estadoActual = String(item.estado || 'pendiente').toLowerCase();

                return (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{item.nombre_cliente || 'N/A'}</strong>
                      <div style={{ fontSize: '11px', color: '#777' }}>{item.cliente_email}</div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '13px', color: '#444', maxWidth: '300px' }}>
                      {item.especificaciones}
                    </td>
                    
                    {/* COLUMNA MODIFICADA: Renderiza hasta 3 imágenes en la misma celda */}
                    <td style={styles.td}>
                      {item.imagen_reference_url ? (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {item.imagen_reference_url.split(',').map((url, index) => (
                            <a 
                              key={index} 
                              href={url.trim()} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <img 
                                src={url.trim()} 
                                alt={`Referencia ${index + 1}`} 
                                style={styles.imgMiniatura} 
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#ccc', fontSize: '12px' }}>Sin foto</span>
                      )}
                    </td>

                    <td style={{ ...styles.td, fontSize: '12px', color: '#666' }}>
                      {item.creado_en ? new Date(item.creado_en).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...obtenerEstiloBadge(estadoActual) }}>
                        {estadoActual}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={estadoActual}
                        onChange={(e) => actualizarEstado(item.id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="pendiente">⏳ Pendiente</option>
                        <option value="en proceso">🧵 En proceso</option>
                        <option value="listo">✅ Listo</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'sans-serif' },
  mainTitle: { fontFamily: '"Comfortaa", cursive', color: '#333', textAlign: 'center', margin: '0' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' },
  tableResponsive: { overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #ffe3ec' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  theadRow: { backgroundColor: '#ff8aae' },
  th: { padding: '14px', color: 'white', fontWeight: 'bold', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f2f2f2', transition: 'background-color 0.2s' },
  td: { padding: '14px', verticalAlign: 'middle', fontSize: '14px' },
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  imgMiniatura: { width: '55px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ffe3ec', cursor: 'pointer' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #ff8aae', backgroundColor: '#fff', fontSize: '13px', color: '#333', cursor: 'pointer', outline: 'none' }
};

export default ListaConsultas;