import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { githubDark } from "@uiw/codemirror-theme-github";
import { Loader2, Pencil, Eraser, Trash2 } from "lucide-react";

const socket = io('https://realtimeeditor-d9po.onrender.com');

const App = () => {
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [code, setCode] = useState('<!-- Start coding here -->');
  const [isUploading, setIsUploading] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [showCanvas, setShowCanvas] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const createRoom = () => {
    socket.emit('createRoom');
    socket.on('roomCreated', ({ roomId }) => {
      setRoomId(roomId);
      setJoinedRoom(true);
    });
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    socket.emit('joinRoom', { roomId });
  };
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctxRef.current = ctx;
  };

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

    if (tool === 'pencil') {
      ctxRef.current.globalCompositeOperation = 'source-over';
      ctxRef.current.strokeStyle = '#ff0000';
      ctxRef.current.lineWidth = 2;
    } else {
      ctxRef.current.globalCompositeOperation = 'destination-out';
      ctxRef.current.lineWidth = 20;
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    ctxRef.current.closePath();
    
    const canvasData = canvasRef.current.toDataURL();
    socket.emit('canvas-update', { roomId, canvasData });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('canvas-update', { roomId, canvasData: null });
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('roomId', roomId);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploadedImage(data.url);
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };
  useEffect(() => {
    socket.on('roomJoined', () => setJoinedRoom(true));
    socket.on('code-update', setCode);
    socket.on('image', ({ url }) => setUploadedImage(url));
    socket.on('error', alert);
    socket.on('canvas-update', ({ canvasData }) => {
      if (!canvasData || !canvasRef.current) return;
      
      const img = new Image();
      img.src = canvasData;
      img.onload = () => {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.drawImage(img, 0, 0);
      };
    });

    return () => {
      socket.off('roomJoined');
      socket.off('code-update');
      socket.off('image');
      socket.off('error');
      socket.off('canvas-update');
    };
  }, []);

  useEffect(() => {
    if (showCanvas) {
      initializeCanvas();
    }
  }, [showCanvas, uploadedImage]);
  if (!joinedRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Collaborative Code Editor</h1>
          <div className="space-y-4">
            <button 
              onClick={createRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Create New Room
            </button>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={joinRoom}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Room: {roomId}</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              {showCanvas ? 'Hide Annotation' : 'Show Annotation'}
            </button>
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition-colors">
              Upload Image
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {isUploading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin" />
                <span className="ml-2">Uploading...</span>
              </div>
            )}
            
            {uploadedImage && (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded design"
                  className="rounded-lg shadow-lg max-w-full"
                />
                {showCanvas && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                )}
              </div>
            )}

            {showCanvas && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setTool('pencil')}
                  className={`p-2 rounded ${tool === 'pencil' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded ${tool === 'eraser' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  <Eraser className="w-5 h-5" />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-2 rounded bg-gray-700 hover:bg-gray-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <CodeMirror
                value={code}
                height="400px"
                theme={githubDark}
                extensions={[html()]}
                onChange={(value) => {
                  setCode(value);
                  socket.emit('code-change', { roomId, code: value });
                }}
              />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <iframe
                srcDoc={code}
                title="Preview"
                className="w-full h-96 bg-white rounded"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
