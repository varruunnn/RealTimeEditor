const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Storage for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Rooms and their states
const rooms = new Map();

// File upload route
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  const { roomId } = req.body;

  if (rooms.has(roomId)) {
    rooms.get(roomId).image = imageUrl;
    io.to(roomId).emit('image', { url: imageUrl });
  }
  
  res.json({ url: imageUrl });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', () => {
    const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
    socket.join(roomId);
    rooms.set(roomId, { code: '', image: null, annotations: [], users: new Set([socket.id]) });
    socket.emit('roomCreated', { roomId });
    console.log(`Room created: ${roomId}`);
  });

  socket.on('joinRoom', ({ roomId }) => {
    if (!rooms.has(roomId)) {
      return socket.emit('error', 'Room does not exist');
    }
    socket.join(roomId);
    const room = rooms.get(roomId);
    room.users.add(socket.id);
    socket.emit('roomJoined', { code: room.code, annotations: room.annotations });
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  socket.on('canvas-update', ({ roomId, canvasData }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).canvasData = canvasData;
      socket.to(roomId).emit('canvas-update', { canvasData });
    }
  });
  

  socket.on('code-change', ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
      socket.to(roomId).emit('code-update', code);
    }
  });

  socket.on('annotation-change', ({ roomId, annotations }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).annotations = annotations;
      socket.to(roomId).emit('annotation-update', annotations);
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      room.users.delete(socket.id);
      if (room.users.size === 0) {
        rooms.delete(roomId);
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Server setup
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
