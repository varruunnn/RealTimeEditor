const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://real-time-editor-gilt.vercel.app", 
    methods: ["GET", "POST"],
    credentials: true, 
  },
});

app.use(cors({
  origin: "https://real-time-editor-gilt.vercel.app", 
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  users: { type: [String], default: [] },
  code: String,
  annotations: Array,
  image: String,
});

const Room = mongoose.model('Room', RoomSchema);
const rooms = new Map(); 
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.post('/upload', upload.single('image'), async (req, res) => {
  const { roomId } = req.body;
  const file = req.file;

  if (!file || !roomId) {
    return res.status(400).json({ error: 'Image or Room ID missing' });
  }
  const base64Image = file.buffer.toString('base64');
  const imageUrl = `data:${file.mimetype};base64,${base64Image}`;

  try {
    const room = await Room.findOneAndUpdate(
      { roomId },
      { image: imageUrl },
      { new: true, upsert: true }
    );
    io.to(roomId).emit('image-update', { image: room.image });
    res.json({ url: room.image });
  } catch (error) {
    console.error('Error saving image to DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createRoom', async () => {
    const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
   
    try {
      await Room.create({ roomId });
      rooms.set(roomId, { canvasData: null });
      socket.join(roomId);
      console.log(`Room created: ${roomId}`);
      socket.emit('roomCreated', { roomId });
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', 'Failed to create room');
    }
  })

  socket.on('joinRoom', ({ roomId }) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      socket.emit('roomJoined');
      const room = rooms.get(roomId)
      if (room.canvasData) {
        socket.emit('canvas-update', { canvasData: room.canvasData })
      }
    } else {
      socket.emit('error', `Room with ID ${roomId} does not exist.`)
    }
  })


  socket.on('code-change', async ({ roomId, code }) => {
    try {
      const room = await Room.findOneAndUpdate({ roomId }, { code }, { new: true });
      socket.to(roomId).emit('code-update', room.code);
    } catch (error) {
      console.error('Error updating code:', error);
    }
  });
  socket.on('canvas-update', ({ roomId, canvasData }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.canvasData = canvasData;
      socket.to(roomId).emit('canvas-update', { canvasData }); 
    } else {
      console.error(`Room with ID ${roomId} does not exist.`);
    }
  });
  socket.on('annotation-change', ({ roomId, annotations }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).annotations = annotations;
      socket.to(roomId).emit('annotation-update', annotations);
    }
  });
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
