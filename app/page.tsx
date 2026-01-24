"use client";
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { score } from './brain'; 

export default function SignLanguageVision() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState<string>("--");
  const [sentence, setSentence] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(true);

  const track = useRef({ lastChar: "", startTime: 0 });
  const classes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'Space', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const calculateDistances = (landmarks: any[]) => {
    const distances: number[] = [];
    for (let i = 0; i < landmarks.length; i++) {
      for (let j = i + 1; j < landmarks.length; j++) {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        const d = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
        );
        distances.push(d);
      }
    }
    return distances;
  };

  useEffect(() => {
    if (showModal) return;

    let hands: any = null;
    let cameraActive = true;
    let animationFrameId: number;

    const startSystem = async () => {
      const loadScript = (src: string) => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          document.head.appendChild(script);
        });
      };

      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");

      // @ts-ignore
      hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      hands.onResults((results: any) => {
        if (!cameraActive || !canvasRef.current) return;
        const canvasCtx = canvasRef.current.getContext('2d')!;
        canvasRef.current.width = results.image.width;
        canvasRef.current.height = results.image.height;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (const landmarks of results.multiHandLandmarks) {
            // Skeleton Visual (Apple White Style)
            // @ts-ignore
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: 'rgba(255,255,255,0.3)', lineWidth: 1.5 });
            // @ts-ignore
            window.drawLandmarks(canvasCtx, landmarks, { color: '#FFFFFF', lineWidth: 1, radius: 2 });

            const inputData = calculateDistances(landmarks);

            try {
              const prediction = score(inputData);
              let finalIndex = Array.isArray(prediction) ? prediction.indexOf(Math.max(...prediction)) : prediction;
              let currentChar = classes[finalIndex] || "--";
              setLabel(currentChar === "Space" ? "⎵" : currentChar);

              if (currentChar !== "--" && track.current.lastChar === currentChar) {
                const duration = (Date.now() - track.current.startTime) / 1500;
                setProgress(Math.min(duration * 100, 100));
                if (duration >= 1) {
                  setSentence(p => p + (currentChar === "Space" ? " " : currentChar));
                  track.current.lastChar = ""; 
                  track.current.startTime = 0;
                  setProgress(0);
                }
              } else {
                track.current.lastChar = currentChar;
                track.current.startTime = Date.now();
                setProgress(0);
              }
            } catch (err) { console.error(err); }
          }
        } else {
          setLabel("--");
          setProgress(0);
        }
        canvasCtx.restore();
      });

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          
          const processFrame = async () => {
            if (cameraActive && videoRef.current && hands) {
              await hands.send({ image: videoRef.current });
              animationFrameId = requestAnimationFrame(processFrame);
            }
          };
          processFrame();
        }
      }
    };

    startSystem();

    return () => {
      cameraActive = false;
      cancelAnimationFrame(animationFrameId);
      if (hands) hands.close();
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [showModal]);

  return (
    <main className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden text-[#F5F5F7]">
      
      {/* --- APPLE STYLE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-6">
          <div className="w-full max-w-[360px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-semibold tracking-tight mb-2">VeroVision</h1>
              <p className="text-neutral-400 font-light">Sign Language Recognition</p>
            </div>
            
            <div className="w-full space-y-6 mb-16 px-4">
              <div className="text-center">
                <p className="text-sm font-medium text-white">Daffa Ahmad Al Attas</p>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-1">Teknologi Informasi</p>
              </div>
              <div className="text-center text-sm font-medium">
                <p>Maqrodza Najwa Putri Fadilah</p>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-1 font-normal">Keuangan dan Perbankan</p>
              </div>
              <div className="text-center text-sm font-medium">
                <p>Naurah Wasyilah</p>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-1 font-normal">Keuangan dan Perbankan</p>
              </div>
              <div className="text-center text-sm font-medium">
                <p>Branang Aura Madani</p>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-1 font-normal">Administrasi Bisnis</p>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)} 
              className="w-full py-4 bg-white text-black rounded-full font-semibold text-sm transition-all active:scale-95 shadow-xl"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* VIEWPORT */}
      <div className="relative flex-1 w-full bg-black">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-90" />
      </div>

      {/* --- APPLE STYLE BOTTOM BAR --- */}
      <div className="relative h-40 w-full bg-[#121217]/80 backdrop-blur-3xl border-t border-white/5 flex flex-row items-center px-8 gap-8 z-40">
        
        {/* PREDIKSI */}
        <div className="flex flex-col items-center justify-center w-20 shrink-0">
          <span className="text-[10px] text-neutral-500 font-medium mb-1">Karakter</span>
          <div className="text-5xl font-light text-white leading-tight">{label}</div>
          <div className="w-full h-[3px] bg-white/10 mt-3 rounded-full overflow-hidden">
             <div className="h-full bg-white transition-all duration-75" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-[0.5px] h-12 bg-white/10 shrink-0" />

        {/* TRANSCRIPT */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <span className="text-[10px] text-neutral-500 font-medium mb-1">Transkripsi Langsung</span>
          <div className="text-xl text-white font-light truncate tracking-tight">
            {sentence || "Menunggu input..."}
          </div>
        </div>

        {/* CLEAR ACTION */}
        <button 
          onClick={() => setSentence("")}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 active:bg-white/10 transition-all shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
        </button>

      </div>
    </main>
  );
}