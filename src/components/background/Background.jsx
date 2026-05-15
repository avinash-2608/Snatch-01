import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    console.log('Background mounted, ref:', vantaRef.current);

    // Ensure DOM element exists before initializing
    if (!vantaRef.current) {
      console.error('Background ref is null, cannot initialize Vanta');
      return;
    }

    // Dynamically import Vanta to avoid SSR issues
    const loadVanta = async () => {
      try {
        console.log('Loading Vanta NET effect...');
        const NETModule = await import('vanta/dist/vanta.net.min');
        const NETEffect = NETModule.default;

        console.log('Initializing Vanta with element:', vantaRef.current);
        vantaEffect.current = NETEffect({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x4f46e5,      // Indigo-600
          backgroundColor: 0x0f172a,  // Slate-900 (dark)
          points: 10.00,         // Moderate point count
          maxDistance: 23.00,    // Moderate spacing
          spacing: 20.00,
          showDots: true,
          showLines: true,
          lineWidth: 1.5
        });

        console.log('Vanta effect initialized successfully');
      } catch (error) {
        console.error('Failed to load Vanta background:', error);
      }
    };

    loadVanta();

    // Cleanup
    return () => {
      console.log('Background unmounting, destroying Vanta effect');
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-auto"
      style={{
        backgroundColor: '#0f172a', // Fallback while loading
        // Uncomment below to test visibility (should see red if working):
        // backgroundColor: 'red',
      }}
    />
  );
}
