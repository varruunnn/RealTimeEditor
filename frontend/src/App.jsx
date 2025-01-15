import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { githubDark } from "@uiw/codemirror-theme-github";

const socket = io('http://localhost:3000'); 

const App = () => {
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [image, setImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [code, setCode] = useState('Upload the Figma File and Start Coding Frontend');
  const createRoom = () => {
    socket.emit('createRoom');
    socket.on('roomCreated', ({ roomId }) => {
      setRoomId(roomId);
      setJoinedRoom(true);
    });
  };
  const joinRoom = () => {
    socket.emit('joinRoom', { roomId });
    socket.on('roomJoined', ({ code }) => {
      setJoinedRoom(true);
      setCode(code);
    });
    socket.on('error', (message) => {
      alert(message);
    });
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
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
      console.error('Error uploading image:', error);
    }
  };
  useEffect(() => {
    socket.on('image', (data) => {
      if (data.image) {
        const blob = new Blob([data.buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setImage(url);
      }
    });

    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off('image');
      socket.off('code-update');
    };
  }, []);
  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };
  if (!joinedRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-5">Join or Create a Room</h1>
        <div className="flex gap-3">
          <button onClick={createRoom} className="bg-green-500 px-4 py-2 rounded">Create Room</button>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="px-4 py-2 text-black rounded"
          />
          <button onClick={joinRoom} className="bg-blue-500 px-4 py-2 rounded">Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-5">
        <h1 className="text-2xl font-bold text-center mb-5">Room: {roomId}</h1>
        <div className="flex flex-col items-center mb-5">
          <input type="file" onChange={handleImageUpload} className="mb-3 bg-gray-800 text-white p-2 rounded" />
          {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="w-80 mt-3 border border-gray-600" />}
          {image && <img src={image} alt="Broadcasted" className="w-80 mt-5 border border-gray-600" />}
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Code Editor</h2>
            <CodeMirror
              value={code}
              height="400px"
              theme={githubDark}
              extensions={[html()]}
              onChange={handleCodeChange}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Live Preview</h2>
            <iframe
              srcDoc={code}
              title="Live Preview"
              className="w-full h-96 border border-gray-600 rounded"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

