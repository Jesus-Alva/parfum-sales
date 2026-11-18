"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Camera, ImageUp, X } from "lucide-react";

export default function OrderQRScanner({ onScan, onClose }: { onScan: (value: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const onScanRef = useRef(onScan);
  const [cameraError, setCameraError] = useState("");
  const [fileError, setFileError] = useState("");
  const [readingFile, setReadingFile] = useState(false);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Este navegador no permite acceder a la cámara. Puedes cargar una imagen del QR.");
      return;
    }
    if (!window.isSecureContext) {
      setCameraError("La cámara requiere HTTPS o localhost. Carga una imagen del QR para continuar desde esta dirección.");
      return;
    }

    let disposed = false;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    reader.decodeFromVideoDevice(undefined, videoRef.current!, (result, _error, controls) => {
      controlsRef.current = controls;
      if (result && !disposed) {
        controls.stop();
        onScanRef.current(result.getText());
      }
    }).then((controls) => {
      if (disposed) controls.stop();
      else controlsRef.current = controls;
    }).catch((error: unknown) => {
      if (disposed) return;
      const detail = error instanceof Error ? error.message : "No fue posible iniciar la cámara.";
      setCameraError(`${detail} También puedes cargar una imagen del QR.`);
    });

    return () => {
      disposed = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      readerRef.current = null;
    };
  }, []);

  const readImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFileError("");
    setReadingFile(true);
    const imageUrl = URL.createObjectURL(file);
    try {
      const reader = readerRef.current ?? new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(imageUrl);
      onScanRef.current(result.getText());
    } catch {
      setFileError("No se pudo leer el QR de la imagen. Intenta con una foto más nítida.");
    } finally {
      URL.revokeObjectURL(imageUrl);
      setReadingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="glass w-full max-w-lg space-y-4 rounded-2xl border border-scentia-border p-5" role="dialog" aria-modal="true" aria-labelledby="scan-order-qr-title">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-scentia-muted">Pedidos</p><h2 id="scan-order-qr-title" className="font-display text-2xl text-gradient-gold">Escanear pedido</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg border border-scentia-border p-2 text-scentia-muted hover:text-scentia-text" aria-label="Cerrar lector"><X size={18} /></button>
        </div>

        <div className="overflow-hidden rounded-xl border border-scentia-border bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
        </div>

        {cameraError && <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{cameraError}</p>}
        {fileError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{fileError}</p>}

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-scentia-gold/40 px-4 py-3 text-sm text-scentia-gold transition hover:bg-scentia-gold/10">
          {readingFile ? <span className="animate-pulse">Leyendo imagen…</span> : <><ImageUp size={17} /> Cargar imagen del QR</>}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={readImage} disabled={readingFile} />
        </label>
        {!cameraError && <p className="flex items-center justify-center gap-2 text-xs text-scentia-muted"><Camera size={14} /> Centra el código QR frente a la cámara.</p>}
      </section>
    </div>
  );
}
