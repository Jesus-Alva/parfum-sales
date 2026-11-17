import type { CSSProperties } from "react";

const particles = [
  { x: 8, y: 12, size: 4, duration: 8, delay: -2 },
  { x: 18, y: 34, size: 5, duration: 10, delay: -6 },
  { x: 27, y: 72, size: 3, duration: 9, delay: -4 },
  { x: 38, y: 19, size: 4, duration: 11, delay: -8 },
  { x: 47, y: 53, size: 5, duration: 12, delay: -3 },
  { x: 56, y: 86, size: 3, duration: 9, delay: -7 },
  { x: 66, y: 28, size: 4, duration: 10, delay: -5 },
  { x: 73, y: 64, size: 5, duration: 12, delay: -9 },
  { x: 83, y: 15, size: 3, duration: 8, delay: -1 },
  { x: 92, y: 45, size: 4, duration: 11, delay: -6 },
  { x: 13, y: 88, size: 3, duration: 12, delay: -10 },
  { x: 61, y: 8, size: 4, duration: 9, delay: -4 },
  { x: 32, y: 43, size: 3, duration: 10, delay: -7 },
  { x: 79, y: 90, size: 4, duration: 8, delay: -3 },
  { x: 4, y: 60, size: 3, duration: 11, delay: -9 },
  { x: 54, y: 37, size: 4, duration: 9, delay: -5 },
  { x: 96, y: 74, size: 5, duration: 12, delay: -8 },
  { x: 23, y: 7, size: 3, duration: 8, delay: -1 },
  { x: 69, y: 49, size: 4, duration: 11, delay: -6 },
  { x: 43, y: 93, size: 3, duration: 10, delay: -4 },
];

export default function LandingAtmosphere() {
  return (
    <div className="landing-atmosphere__backdrop" aria-hidden="true">
      <div className="landing-atmosphere__aurora" />
      <div className="landing-atmosphere__trails" />
      <div className="landing-atmosphere__particles">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="landing-atmosphere__particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              "--particle-duration": `${particle.duration}s`,
              "--particle-delay": `${particle.delay}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
