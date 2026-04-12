import { useEffect, useState } from 'react';

const MAX_X = 16;
const MAX_Y = 14;

export function useMouseParallax() {
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      setTransform({
        x: -(x * MAX_X),
        y: y * MAX_Y
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return {
    transform: `rotateX(${transform.y}deg) rotateY(${transform.x}deg)`
  };
}
