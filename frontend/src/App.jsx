import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { githubDark } from "@uiw/codemirror-theme-github";
import { Loader2, Pencil, Eraser, Trash2, Maximize2, Minimize2, Copy, Check } from "lucide-react";
import LandingPage from './components/Landingpage';
const socket = io('https://realtimeeditor-c36r.onrender.com');

const Editor = () => {
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [code, setCode] = useState('<!-- Start coding here -->');
  const [loading, setloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [showCanvas, setShowCanvas] = useState(false);
  const [editorHeight, setEditorHeight] = useState(400);
  const [previewHeight, setPreviewHeight] = useState(400);
  const [imageSize, setImageSize] = useState('medium');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const dragRef = useRef(null);

  const createRoom = () => {
    setloading(true);
    socket.emit('createRoom');
    socket.on('roomCreated', ({ roomId }) => {
      setRoomId(roomId);
      setJoinedRoom(true);
      setloading(false)
    });
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    setloading(true)
    socket.emit('joinRoom', { roomId });
  };
  const copyRoomId = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageSize = () => {
    const sizes = {
      small: 'medium',
      medium: 'large',
      large: 'small'
    };
    setImageSize(sizes[imageSize]);
  };
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setEditorHeight(600);
      setPreviewHeight(600);
    } else {
      setEditorHeight(400);
      setPreviewHeight(400);
    }
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
    if (!file) {
      alert("No file selected");
      return;
    }

    if (!roomId) {
      alert("Please join a room before uploading an image.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('roomId', roomId);

    try {
      const response = await fetch('https://realtimeeditor-c36r.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.url) {
        setUploadedImage(data.url);
        setShowCanvas(true);
        alert("Image uploaded successfully!");
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    socket.on('roomJoined', () => {
      setJoinedRoom(true);
      setLoading(false);
    });
    socket.on('code-update', setCode);
    socket.on('image', ({ url }) => {
      setUploadedImage(url);
    });
    socket.on('image-update', ({ image }) => {
      setUploadedImage(image);
    });
    socket.on('canvas-update', ({ canvasData }) => {
      if (!canvasData || !canvasRef.current) return;

      const img = new Image();
      img.src = canvasData;
      img.onload = () => {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.drawImage(img, 0, 0);
      };
    });
    socket.on('error', alert);

    return () => {
      socket.off('roomJoined');
      socket.off('code-update');
      socket.off('image');
      socket.off('image-update');
      socket.off('canvas-update');
      socket.off('error');
    };
  }, []);
  useEffect(() => {
    if (showCanvas) {
      initializeCanvas();
    }
  }, [showCanvas]);

if (!joinedRoom) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          <span className="text-lg">Joining Room...</span>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-96 border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Collaborative Code Editor
          </h1>
          <div className="space-y-4">
            <button 
              onClick={createRoom}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Create New Room
            </button>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
              />
              <button 
                onClick={joinRoom}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-8xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-gray-800/50 backdrop-blur-lg p-4 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Room: {roomId}</h1>
            <button
              onClick={copyRoomId}
              className="flex items-center space-x-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium flex items-center space-x-2"
            >
              {showCanvas ? 'Hide Annotation' : 'Show Annotation'}
            </button>
            <label className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 font-medium flex items-center space-x-2">
              <span>Upload Image</span>
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
          <div className={`space-y-4 transition-all duration-300 ${imageSize === 'small' ? 'lg:col-span-1' :
              imageSize === 'large' ? 'lg:col-span-2' : 'lg:col-span-1'
            }`}>
            {isUploading && (
              <div className="flex items-center justify-center p-4 bg-gray-800/50 backdrop-blur-lg rounded-xl">
                <Loader2 className="animate-spin text-blue-500" />
                <span className="ml-2">Uploading...</span>
              </div>
            )}

            {uploadedImage && (
              <div className="relative group">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleImageSize}
                    className="bg-gray-800/90 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {imageSize === 'small' ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                  <img
                    src={uploadedImage}
                    alt="Uploaded design"
                    className="w-full"
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
              </div>
            )}

            {showCanvas && (
              <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-lg p-3 rounded-xl border border-gray-700">
                <button
                  onClick={() => setTool('pencil')}
                  className={`p-2 rounded-lg transition-colors ${tool === 'pencil' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  <Eraser className="w-5 h-5" />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className={`space-y-4 ${imageSize === 'large' ? 'lg:col-span-2' : 'lg:col-span-1'
            }`}>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 relative group">
              <div className="absolute top-2 right-2 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={toggleFullscreen}
                  className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="200"
                  max="800"
                  value={editorHeight}
                  onChange={(e) => setEditorHeight(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <CodeMirror
                value={code}
                height={`${editorHeight}px`}
                theme={githubDark}
                extensions={[html()]}
                onChange={(value) => {
                  setCode(value);
                  socket.emit('code-change', { roomId, code: value });
                }}
                className="rounded-lg overflow-hidden"
              />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 relative group">
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="range"
                  min="200"
                  max="800"
                  value={previewHeight}
                  onChange={(e) => setPreviewHeight(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <iframe
                srcDoc={code}
                title="Preview"
                style={{ height: `${previewHeight}px` }}
                className="w-full bg-white rounded-lg"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
};

export default App;
