import React from 'react';

export default function Nosotros() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#333' }}>
      <div style={{ textAlign: 'center', marginBottom: '45px' }}>
        <h1 style={{ color: '#d63384', fontSize: '2.5rem', marginBottom: '10px' }}>Nuestra Historia</h1>
        <div style={{ width: '60px', height: '3px', backgroundColor: '#d63384', margin: '0 auto' }}></div>
      </div>

      <div style={{ lineHeight: '1.8', fontSize: '16px', color: '#444' }}>
        <p>
          Bienvenido a <strong>Gurubi-arte</strong>. Somos un taller dedicado al mágico arte de los amigurumis y tejidos a crochet. Lo que comenzó como un pasatiempo impulsado por el amor a los hilos y las texturas, se transformó con el tiempo en un espacio creativo diseñado para dar vida a las ideas de nuestros clientes.
        </p>

        <p style={{ marginTop: '20px' }}>
          Para nosotros, un amigurumi no es simplemente un muñeco de lana; es un compañero de aventuras, un regalo único y un pedacito de arte que transmite calidez. Nos apasiona cuidar cada detalle: desde la selección de estambres suaves e hipoalergénicos, hasta el relleno perfecto que les confiere esa ternura tan característica.
        </p>

        <div style={{ 
          marginTop: '40px', 
          backgroundColor: '#fff0f5', 
          padding: '25px', 
          borderRadius: '12px', 
          borderLeft: '4px solid #d63384' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d63384' }}>✨ Nuestro Compromiso</h3>
          <p style={{ margin: 0, fontSize: '15px', fontStyle: 'italic', color: '#555' }}>
            "Ofrecer creaciones excepcionales que superen tus expectativas. No importa qué tan complejo sea el diseño o el personaje, nos comprometemos a tejer tus sueños con la máxima calidad y precisión."
          </p>
        </div>
      </div>
    </div>
  );
}