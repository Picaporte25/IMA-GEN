import { useEffect, useState } from 'react';

export function ParticlesBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate static particles
    const newParticles = [];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: Math.random() > 0.5 ? 'particle-orange' : 'particle-violet',
        size: 2 + Math.random() * 3,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${particle.color}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
}
