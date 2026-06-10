import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

function Catalogo({ usuario }) {
  const navigate = useNavigate();

  // Estados tradicionales del catálogo
  const [amigurumis, setAmigurumis] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0);

  // Estados para el carrito de consultas
  const [listaConsulta, setListaConsulta] = useState([]); 
  const [mostrarModal, setMostrarModal] = useState(false);
  const [especificaciones, setEspecificaciones] = useState('');
  const [fotoPersonalizada, setFotoPersonalizada] = useState(null);
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data, error } = await supabase.from('productos').select('*');
        if (error) throw error;
        setAmigurumis(data);
      } catch (error) {
        console.error("Error al conectar con Supabase:", error.message);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  // Lógica de filtrado en tiempo real
  const amigurumisFiltrados = amigurumis.filter((item) => {
    const coincideCategoria = categoriaSeleccionada === 0 || item.categoria_id === categoriaSeleccionada;
    const coincideNombre = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideNombre;
  });

  // Función para subir la imagen a Supabase Storage (Bucket publico: 'referencias')
  const subirImagenReferencia = async (archivo) => {
    try {
      const nombreArchivo = `${Date.now()}_${archivo.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('referencias')
        .upload(nombreArchivo, archivo);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('referencias')
        .getPublicUrl(nombreArchivo);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Error al subir archivo a Storage:", err.message);
      return '';
    }
  };

  // Abrir el modal validando si está logueado
  const handleAbrirModal = () => {
    if (!usuario) {
      alert("⚠️ Para realizar una consulta o cotización, por favor inicia sesión o crea una cuenta primero.");
      navigate('/login');
      return;
    }
    setMostrarModal(true);
  };

  // Función tipo interruptor para añadir o quitar productos desde la tarjeta
  const handleToggleProducto = (item) => {
    if (!usuario) {
      alert("⚠️ Para armar tu lista de consulta, por favor inicia sesión o crea una cuenta primero.");
      navigate('/login');
      return;
    }

    const yaExiste = listaConsulta.some(prod => prod.id === item.id);

    if (yaExiste) {
      const nuevaLista = listaConsulta.filter(prod => prod.id !== item.id);
      setListaConsulta(nuevaLista);
    } else {
      setListaConsulta([...listaConsulta, item]);
    }
  };

  const handleQuitarDeLista = (id) => {
    const nuevaLista = listaConsulta.filter(item => item.id !== id);
    setListaConsulta(nuevaLista);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setEspecificaciones('');
    setFotoPersonalizada(null);
  };

const handleEnviarConsulta = async (e) => {
  e.preventDefault();

  // ================= VALIDACIÓN DE SEGURIDAD =================
  // Limpiamos los espacios en blanco del texto para que no hagan trampa con puros "espacios"
  const textoLimpio = especificaciones.trim();

  // 🔄 Reemplaza las líneas 111 a 114 de tu código por esto:
if (listaConsulta.length === 0 && !fotoPersonalizada) {
  alert("⚠️ ¡Ups! Para procesar tu solicitud necesitas seleccionar al menos un amigurumi de nuestro catálogo o subir una foto/dibujo de referencia de tu idea.");
  return; // Bloquea el envío por completo
}
  // ===========================================================

  setEnviandoConsulta(true);
  try {
    // ... todo el resto de tu código de Supabase y EmailJS sigue exactamente igual aquí abajo
      // --- 1. PROCESAMIENTO UNIFICADO DE IMÁGENES ---
      let urlsArray = [];
      let urlUnicaPersonalizada = '';

      if (fotoPersonalizada) {
        const urlStorage = await subirImagenReferencia(fotoPersonalizada);
        if (urlStorage) {
          urlsArray.push(urlStorage);
          urlUnicaPersonalizada = urlStorage; 
        }
      }

      if (listaConsulta.length > 0) {
        const urlsCatalogo = listaConsulta
          .map(p => p.imagen_url)
          .filter(url => url); 
        
        urlsArray = [...urlsArray, ...urlsCatalogo]; 
      }

      const urlFotoReferenciaFinal = urlsArray.join(',');

      // --- 2. CONSTRUCCIÓN DE CONTENIDO PARA BASE DE DATOS Y CORREO ---
      let productosListaText = [];
      let productosListaHTML = [];

      if (listaConsulta.length > 0) {
        listaConsulta.forEach(p => {
          productosListaText.push(`• ${p.nombre}`);
          productosListaHTML.push(`
            <div style="display:flex; align-items:center; margin-bottom:12px;">
              <img src="${p.imagen_url}" width="60" height="60" style="object-fit:cover; border-radius:6px; margin-right:12px; border:1px solid #eee;" />
              <span style="font-weight:bold; color:#333; font-size:14px;">${p.nombre}</span>
            </div>
          `);
        });
      }

      if (fotoPersonalizada) {
        productosListaText.push(`• Diseño Personalizado`);
        productosListaHTML.push(`
          <div style="display:flex; align-items:center; margin-bottom:12px;">
            <img src="${urlUnicaPersonalizada}" width="60" height="60" style="object-fit:cover; border-radius:6px; margin-right:12px; border:1px solid #e6f7f5;" />
            <span style="font-weight:bold; color:#46C2B4; font-size:14px;">Diseño Personalizado (Foto adjunta)</span>
          </div>
        `);
      }

      if (listaConsulta.length === 0 && !fotoPersonalizada) {
        productosListaText.push(`• Diseño Personalizado`);
        productosListaHTML.push(`
          <div style="display:flex; align-items:center; margin-bottom:12px;">
            <div style="width:60px; height:60px; background-color:#e6f7f5; border-radius:6px; margin-right:12px; display:flex; align-items:center; justify-content:center; color:#46C2B4; font-weight:bold; font-size:20px;">✨</div>
            <span style="font-weight:bold; color:#46C2B4; font-size:14px;">Diseño Totalmente Personalizado</span>
          </div>
        `);
      }

      const textoProductosFinal = productosListaText.join('\n');
      const htmlProductosFinal = productosListaHTML.join('');

      const especificacionesFormateadasBD = `Productos: ${textoProductosFinal}\nEspecificaciones: ${especificaciones}`;

      // --- 3. REGISTRO EN LA BASE DE DATOS (SUPABASE) ---
      const nombreCliente = usuario.user_metadata?.nombre_completo || usuario.user_metadata?.full_name || usuario.email.split('@')[0] || "Cliente Registrado";

      const { error: dbError } = await supabase
        .from('consultas')
        .insert([
          {
            nombre_cliente: nombreCliente,
            cliente_email: usuario.email, 
            especificaciones: especificacionesFormateadasBD, 
            estado: 'pendiente', 
            imagen_reference_url: urlFotoReferenciaFinal, 
            creado_en: new Date().toISOString() 
          }
        ]);

      if (dbError) throw dbError;

      // --- 4. ENVÍO DE CORREOS (EMAILJS) ---
      const parametrosPlantilla = {
        nombre_cliente: nombreCliente,
        correo_cliente: usuario.email,
        cliente_email: usuario.email,  
        lista_amigurumis: htmlProductosFinal, 
        indicaciones: especificaciones, // ✅ CORREGIDO: Cambiado de specifications a especificaciones
        url_foto: urlUnicaPersonalizada || (urlsArray[0] || '') 
      };

      await emailjs.send('service_5vg7m1w', 'template_b3dye3c', parametrosPlantilla, '7MM_PuDGZr4E3oLCt');
      await emailjs.send('service_5vg7m1w', 'template_wvi0z7g', parametrosPlantilla, '7MM_PuDGZr4E3oLCt');

      alert(`✨ ¡Consulta enviada con éxito! Tu orden ha sido unificada.`);
      setListaConsulta([]);
      setFotoPersonalizada(null); 
      handleCerrarModal();

    } catch (error) {
      console.error("🚨 Error capturado en el envío:", error);
      const mensajeReal = error?.text || error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      alert("Hubo un problema al procesar tu consulta: " + mensajeReal);
    } finally {
      setEnviandoConsulta(false);
    }
  };

  if (cargando) return <p style={{ textAlign: 'center', padding: '100px', fontFamily: 'sans-serif', color: '#46C2B4' }}>Cargando catálogo artesanal... 🧸</p>;

  return (
    <div style={{ padding: '20px', paddingTop: '100px', fontFamily: 'sans-serif', position: 'relative', minHeight: '100vh', backgroundColor: '#fafdfd' }}>

      {/* ================= BOTÓN FLOTANTE SIEMPRE ACTIVO ================= */}
      <div onClick={handleAbrirModal} style={styles.floatingCart}>
        <span style={{ fontSize: '20px' }}>📋</span>
        {listaConsulta.length > 0 && (
          <span style={styles.cartCount}>{listaConsulta.length}</span>
        )}
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {listaConsulta.length > 0 ? 'Consultar Lista' : 'Hacer una Consulta'}
        </span>
      </div>

      {/* Menú de Filtros */}
      <div style={styles.filterMenu}>
        <input
          type="text"
          placeholder="🔍 Buscar amigurumi por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchBar}
        />
        <div style={styles.categoryContainer}>
          {['Todos', 'Animales', 'Personajes', 'Decoraciones'].map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(idx)}
              style={{ 
                ...styles.categoryBtn, 
                backgroundColor: categoriaSeleccionada === idx ? '#46C2B4' : '#fff', 
                color: categoriaSeleccionada === idx ? '#fff' : '#333' 
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', color: '#333', marginTop: '30px', fontFamily: '"Comfortaa", cursive' }}>Nuestro Catálogo</h2>

      {amigurumisFiltrados.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>No encontramos amigurumis que coincidan 😔</p>
      )}

      {/* Grid de Productos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {amigurumisFiltrados.map((item) => {
          const estaEnLista = listaConsulta.some(prod => prod.id === item.id);
          return (
            <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
              <h3 style={{ fontSize: '18px', color: '#444', margin: '10px 0 5px 0' }}>{item.nombre}</h3>
              <p style={{ color: '#777', fontSize: '13px', height: '40px', overflow: 'hidden', margin: '0 0 10px 0' }}>{item.descripcion}</p>

              <button
                onClick={() => handleToggleProducto(item)}
                style={{
                  ...styles.consultarBtn,
                  backgroundColor: estaEnLista ? '#ff4d4d' : '#46C2B4', 
                  transition: 'background-color 0.3s ease'
                }}
              >
                {estaEnLista ? '🗑️ Eliminar de la lista' : 'Añadir a mi Lista'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ======================= MODAL DE LOGICA MIXTA / PERSONALIZADA ======================= */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <button onClick={handleCerrarModal} style={styles.closeModalBtn}>✕</button>

            <h3 style={styles.modalTitle}>Solicitud de Cotización ✨</h3>
            <p style={styles.modalText}>Cuéntanos qué amigurumi tienes en mente para confeccionar:</p>

            {/* Renderizado Condicional de la Lista */}
            <div style={styles.modalProductList}>
              {listaConsulta.length > 0 ? (
                listaConsulta.map((prod) => (
                  <div key={prod.id} style={styles.modalProductItem}>
                    <img src={prod.imagen_url} alt={prod.nombre} style={styles.modalImg} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#333' }}>{prod.nombre}</h4>
                      <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>{prod.descripcion ? prod.descripcion.substring(0, 45) : ''}...</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuitarDeLista(prod.id)}
                      style={styles.removeProductBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '15px', border: '2px dashed #a4ebd4', borderRadius: '8px', backgroundColor: '#f2fbfb' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#2a8e83', fontWeight: 'bold' }}>
                    💡 Cotización de Diseño 100% Personalizado
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888' }}>
                    No seleccionaste amigurumis del catálogo. ¡Puedes pedir lo que imagines aquí abajo!
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleEnviarConsulta} style={styles.modalForm}>
              <label style={styles.modalLabel}>
                📝 Especificaciones, colores o tamaños deseados:
              </label>
              <textarea
                placeholder="Ej: Quiero un llavero de perrito de 8cm parecido a mi mascota, o detalles específicos de los productos seleccionados..."
                value={especificaciones}
                onChange={(e) => setEspecificaciones(e.target.value)}
                required
                style={styles.modalTextarea}
              />

              <label style={styles.modalLabel}>
                📸 Sube una foto o dibujo de tu idea personalizada (Opcional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoPersonalizada(e.target.files[0])}
                style={styles.modalFileInput}
              />

              <div style={styles.modalActionRow}>
                <button type="button" onClick={handleCerrarModal} style={styles.modalCancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={enviandoConsulta} style={styles.modalSubmitBtn}>
                  {enviandoConsulta ? 'Enviando...' : 'Enviar Consulta ✉️'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  filterMenu: { backgroundColor: '#e6f7f5', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', maxWidth: '800px', margin: '10px auto' },
  searchBar: { width: '100%', maxWidth: '500px', padding: '12px 20px', borderRadius: '25px', border: '2px solid #46C2B4', fontSize: '16px', outline: 'none' },
  categoryContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
  categoryBtn: { padding: '10px 20px', border: '2px solid #46C2B4', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' },
  consultarBtn: { color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginTop: '10px', transition: 'background-color 0.2s' },
  floatingCart: { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#46C2B4', color: 'white', padding: '15px 25px', borderRadius: '30px', boxShadow: '0 4px 20px rgba(70, 194, 180, 0.4)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 1500, transition: 'transform 0.2s' },
  cartCount: { backgroundColor: 'white', color: '#46C2B4', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  modalCard: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '550px', boxShadow: '0px 10px 30px rgba(0,0,0,0.15)', position: 'relative' },
  closeModalBtn: { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
  modalTitle: { fontFamily: '"Comfortaa", cursive', color: '#46C2B4', margin: '0 0 5px 0', fontSize: '22px' },
  modalText: { fontSize: '14px', color: '#666', margin: '0 0 15px 0' },
  modalProductList: { maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', paddingRight: '5px' },
  modalProductItem: { display: 'flex', gap: '12px', backgroundColor: '#e6f7f5', padding: '10px', borderRadius: '8px', alignItems: 'center' },
  modalImg: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' },
  removeProductBtn: { backgroundColor: 'transparent', border: 'none', color: '#ff4d4d', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', padding: '0 5px' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  modalLabel: { fontSize: '14px', fontWeight: 'bold', color: '#444', textAlign: 'left' },
  modalTextarea: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', height: '80px', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'sans-serif' },
  modalFileInput: { fontSize: '14px' },
  modalActionRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '5px' },
  modalCancelBtn: { padding: '10px 20px', backgroundColor: '#f1f1f1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#555' },
  modalSubmitBtn: { padding: '10px 20px', backgroundColor: '#46C2B4', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: 'white' }
};

export default Catalogo;