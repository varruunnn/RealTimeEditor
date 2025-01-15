const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading file' });
    }

    const { roomId } = req.body;
    io.to(roomId).emit('image', { image: true, buffer: buf });
  });

  res.json({ 
    message: 'File uploaded successfully',
    url: `http://localhost:3000/uploads/${req.file.filename}`,
  });
});
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('createRoom', () => {
    const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
    rooms.set(roomId, { code: 'Upload the Image and start Coding with Friends \n' });
    socket.join(roomId);
    console.log(`Room created: ${roomId}`);
    socket.emit('roomCreated', { roomId });
  });
  socket.on('joinRoom', ({ roomId }) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      socket.emit('roomJoined', { roomId, code: rooms.get(roomId).code });
      console.log(`User ${socket.id} joined room ${roomId}`);
    } else {
      socket.emit('error', 'Room does not exist');
    }
  });
  socket.on('code-change', ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
      socket.to(roomId).emit('code-update', code);
    }
  });
  socket.on('image-upload', ({ roomId, imageUrl }) => {
    if (rooms.has(roomId)) {
      socket.to(roomId).emit('image', { image: true, imageUrl });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
