import React, { useEffect, useRef } from 'react';
import { Pencil, Eraser, Trash2 } from 'lucide-react';

const AnnotationCanvas = ({ showCanvas, uploadedImage, roomId, socket }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!showCanvas || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    ctxRef.current = ctx;
  }, [showCanvas]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;
    ctxRef.current.closePath();

    const canvasData = canvasRef.current.toDataURL();
    socket.emit('canvas-update', { roomId, canvasData });
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit('canvas-update', { roomId, canvasData: null });
  };

  if (!uploadedImage) return null;

  return (
    <div className="relative">
      <img src={uploadedImage} alt="Uploaded" className="rounded-lg shadow-lg max-w-full" />
      {showCanvas && (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => (ctxRef.current.globalCompositeOperation = 'source-over')}
              className="p-2 bg-red-600 rounded"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => (ctxRef.current.globalCompositeOperation = 'destination-out')}
              className="p-2 bg-red-600 rounded"
            >
              <Eraser className="w-5 h-5" />
            </button>
            <button onClick={clearCanvas} className="p-2 bg-red-600 rounded">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnnotationCanvas;
