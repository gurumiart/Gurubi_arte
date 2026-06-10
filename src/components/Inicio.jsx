import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
      {/* SECCIÓN HERO (Banner de bienvenida) */}
      <div style={{
        backgroundColor: '#fff0f5',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '2px dashed #f8d7da',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#d63384', margin: '0 0 15px 0' }}>🐾 Todo lo que imagines a Crochet</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
          Damos vida a tus personajes favoritos, recuerdos y diseños personalizados hechos 100% a mano con hilos de la mejor calidad.
        </p>
        <button 
          onClick={() => navigate('/catalogo')}
          style={{
            backgroundColor: '#d63384',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '25px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(214, 51, 132, 0.2)',
            transition: '0.2s'
          }}
        >
          ✨ Explorar Catálogo
        </button>
      </div>

      {/* SECCIÓN DE CARACTERÍSTICAS */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', marginBottom: '5px' }}>
        <h2 style={{ textAlign: 'center', color: '#d63384', marginBottom: '30px' }}>¿Por qué elegir Gurubi-arte?</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f8d7da', borderRadius: '12px', backgroundColor: '#fff' }}>
            <span style={{ fontSize: '40px' }}>🧵</span>
            <h3 style={{ color: '#d63384' }}>Hecho a Mano</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>Cada puntada lleva dedicación, cuidado y mucho amor para asegurar un acabado tierno y duradero.</p>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f8d7da', borderRadius: '12px', backgroundColor: '#fff' }}>
            <span style={{ fontSize: '40px' }}>🎨</span>
            <h3 style={{ color: '#d63384' }}>100% Personalizado</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>¿Tienes un dibujo o una idea en mente? Nosotros lo transformamos en un adorable peluche tejido.</p>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f8d7da', borderRadius: '12px', backgroundColor: '#fff' }}>
            <span style={{ fontSize: '40px' }}>📬</span>
            <h3 style={{ color: '#d63384' }}>Cotización Ágil</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>Añade tus piezas favoritas al carrito, describe tus indicaciones y recibe una respuesta directo en tu correo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}