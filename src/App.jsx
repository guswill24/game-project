// src/App.jsx
import { useEffect, useRef } from 'react';
import Experience from './Experience/Experience';

const App = () => {
  const canvasRef = useRef();

  useEffect(() => {
    new Experience(canvasRef.current);
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
};

export default App;
