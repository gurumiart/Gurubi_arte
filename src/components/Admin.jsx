import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Admin() {
  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null); 
  const [categoriaId, setCategoriaId] = useState(1);
  
  // ESTADOS NUEVOS PARA LA EDICIÓN
  const [idModoEdicion, setIdModoEdicion] = useState(null); 
  const [imagenUrlActual, setImagenUrlActual] = useState(''); 

  // Estados para listar productos
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Estado clave para limpiar el input de archivo sin romper React
  const [llaveInputArchivo, setLlaveInputArchivo] = useState(Date.now());

  const obtenerProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error al obtener productos:", error.message);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // Función para subir una imagen al Storage de Supabase
  const subirImagen = async (archivo) => {
    try {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      
      const { data, error } = await supabase.storage
        .from('imagenes-amigurumis')
        .upload(nombreArchivo, archivo);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('imagenes-amigurumis')
        .getPublicUrl(nombreArchivo);

      return publicUrlData.publicUrl;
    } catch (error) {
      throw new Error("Error al subir la imagen: " + error.message);
    }
  };

  // Guardar datos (Soporta INSERT y UPDATE)
  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      let finalImagenUrl = imagenUrlActual;

      if (archivoImagen) {
        finalImagenUrl = await subirImagen(archivoImagen);
      }

      if (idModoEdicion) {
        // --- PROCESO DE ACTUALIZACIÓN (UPDATE) ---
        const { error } = await supabase
          .from('productos')
          .update({
            nombre: nombre,
            descripcion: descripcion,
            imagen_url: finalImagenUrl,
            categoria_id: Number(categoriaId)
          })
          .eq('id', idModoEdicion);

        if (error) throw error;
        alert("¡Amigurumi actualizado correctamente! 🔄");
      } else {
        // --- PROCESO DE CREACIÓN (INSERT) ---
        if (!archivoImagen) {
          alert("Por favor, selecciona una imagen para el nuevo amigurumi.");
          setCargando(false);
          return;
        }

        const { error } = await supabase
          .from('productos')
          .insert([
            { 
              nombre: nombre, 
              descripcion: descripcion, 
              imagen_url: finalImagenUrl, 
              categoria_id: Number(categoriaId) 
            }
          ]);

        if (error) throw error;
        alert("¡Amigurumi añadido exitosamente al catálogo! 🎉");
      }

      handleCancelarEdicion();
      obtenerProductos();
    } catch (error) {
      alert("Error en la operación: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // Activar el modo de edición cargando los datos en el formulario
  const handleActivarEdicion = (prod) => {
    setIdModoEdicion(prod.id);
    setNombre(prod.nombre);
    setDescripcion(prod.descripcion);
    setCategoriaId(prod.categoria_id);
    setImagenUrlActual(prod.imagen_url);
    setArchivoImagen(null); 
    setLlaveInputArchivo(Date.now()); // Resetea el input de archivo de forma segura
  };

  // Salir del modo edición y limpiar formulario
  const handleCancelarEdicion = () => {
    setIdModoEdicion(null);
    setNombre('');
    setDescripcion('');
    setArchivoImagen(null);
    setImagenUrlActual('');
    setCategoriaId(1);
    setLlaveInputArchivo(Date.now()); // Forzar a React a recrear el input vacío
  };

  // Eliminar producto
  const handleEliminarProducto = async (id, nombreProducto) => {
    const confirmar = window.confirm(`¿Estás segura de que deseas eliminar a "${nombreProducto}" del catálogo?`);
    if (!confirmar) return;

    try {
      const { data, error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("⚠️ No se pudo eliminar de la base de datos.");
        return;
      }

      alert("¡Producto eliminado exitosamente! 🗑️");
      if (idModoEdicion === id) handleCancelarEdicion();
      obtenerProductos();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>Panel de Administración 👑</h2>
      <p style={styles.subtitle}>Gestiona el catálogo de Amigurumi-Arte</p>

      <div style={styles.gridLayout}>
        
        {/* ================= FORMULARIO DUAL (CREAR / EDITAR) ================= */}
        <div style={styles.card}>
          <h3 style={{...styles.cardTitle, color: idModoEdicion ? '#2196F3' : '#ff8aae'}}>
            {idModoEdicion ? '📝 Editando Amigurumi' : 'Añadir Nuevo Amigurumi'}
          </h3>
          <form onSubmit={handleGuardarProducto} style={styles.form}>
            
            <label style={styles.label}>Nombre del Amigurumi:</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              style={styles.input}
            />

            <label style={styles.label}>Descripción / Detalles:</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              required 
              style={{...styles.input, height: '80px', resize: 'none'}}
            />

            <label style={styles.label}>
              {idModoEdicion ? 'Cambiar Foto (Opcional):' : 'Selecciona la Foto desde tu equipo:'}
            </label>
            <input 
              key={llaveInputArchivo} // El truco mágico: al cambiar la llave, React limpia el archivo solo
              type="file" 
              accept="image/*"
              onChange={(e) => setArchivoImagen(e.target.files[0])}
              required={!idModoEdicion} 
              style={styles.fileInput}
            />
            
            {idModoEdicion && (
              <p style={{fontSize: '12px', color: '#666', margin: '0'}}>
                * Si no seleccionas un archivo nuevo, se mantendrá la foto actual.
              </p>
            )}

            <label style={styles.label}>Categoría del Producto:</label>
            <select 
              value={categoriaId} 
              onChange={(e) => setCategoriaId(e.target.value)} 
              style={styles.select}
            >
              <option value={1}>1 - Animales 🐻</option>
              <option value={2}>2 - Personajes 🎬</option>
              <option value={3}>3 - Decoraciones 🌸</option>
            </select>

            <button 
              type="submit" 
              disabled={cargando} 
              style={{...styles.submitBtn, backgroundColor: idModoEdicion ? '#2196F3' : '#ff8aae'}}
            >
              {cargando ? 'Guardando...' : idModoEdicion ? 'Guardar Cambios' : 'Publicar en Catálogo'}
            </button>

            {idModoEdicion && (
              <button type="button" onClick={handleCancelarEdicion} style={styles.cancelBtn}>
                Cancelar Edición
              </button>
            )}
          </form>
        </div>

        {/* ================= TABLA DE CONTROL CON BOTÓN EDITAR ================= */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Productos en la Base de Datos ({productos.length})</h3>
          
          <div style={styles.tableWrapper}>
            {productos.length === 0 ? (
              <p style={{color: '#888', textAlign: 'center'}}>No hay productos registrados actualmente.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Miniatura</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id} style={styles.tr}>
                      <td style={styles.td}>
                        <img src={prod.imagen_url} alt={prod.nombre} style={styles.thumbnail} />
                      </td>
                      <td style={{...styles.td, fontWeight: 'bold'}}>{prod.nombre}</td>
                      <td style={styles.td}>
                        {prod.categoria_id === 1 && '🐻 Animales'}
                        {prod.categoria_id === 2 && '🎬 Personajes'}
                        {prod.categoria_id === 3 && '🌸 Decoraciones'}
                      </td>
                      <td style={{...styles.td, display: 'flex', gap: '8px', borderBottom: 'none', paddingTop: '20px'}}>
                        <button 
                          onClick={() => handleActivarEdicion(prod)} 
                          style={styles.editBtn}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleEliminarProducto(prod.id, prod.nombre)} 
                          style={styles.deleteBtn}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' },
  mainTitle: { fontFamily: '"Comfortaa", cursive', color: '#333', textAlign: 'center', margin: '0' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  gridLayout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', alignItems: 'start' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #ffe3ec' },
  cardTitle: { fontFamily: '"Comfortaa", cursive', marginTop: '0', marginBottom: '20px', borderBottom: '2px solid #fff0f5', paddingBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#555' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' },
  fileInput: { fontSize: '14px', padding: '5px 0' },
  select: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px', backgroundColor: '#fff', outline: 'none' },
  submitBtn: { color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s' },
  cancelBtn: { backgroundColor: '#eed', color: '#333', border: '1px solid #ccc', padding: '10px', borderRadius: '6px', fontSize: '15px', cursor: 'pointer' },
  tableWrapper: { maxHeight: '450px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#fff0f5' },
  th: { padding: '12px', fontSize: '14px', color: '#333', borderBottom: '2px solid #ffe3ec' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '10px 12px', fontSize: '14px', verticalAlign: 'middle' },
  thumbnail: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' },
  editBtn: { backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default Admin;