# Frontend Collaboration Platform

A modern real-time platform tailored for **frontend developers** and **interviewers**. This tool enables seamless collaboration by providing features to **upload designs**, **live code with peers**, and even **annotate designs in real-time**.

## Features

### 🌟 Key Features
- **Room Creation & Joining**: Create or join rooms to collaborate in real-time.
- **Live Code Editor**: Write HTML, CSS, and JS using a powerful **CodeMirror-based editor** with GitHub Dark theme support.
- **Live Preview**: Instantly preview your code changes in a live-rendered iframe.
- **Image Upload**: Upload Figma files or other design mockups to collaborate visually.
- **Real-Time Annotations**: Annotate designs using a **pencil tool** or **eraser** for live feedback.
- **Socket.IO Integration**: Ensures all changes, including code, annotations, and image uploads, are synchronized in real-time.
- **Persistent State**: Keeps the code, uploaded images, and annotations intact across reloads.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or above)
- **npm** or **yarn**

## 📦 Installation and Setup

### Steps
   ```bash
   git clone https://github.com/varruunnn/RealTimeEditor.git
   cd RealTimeCodeEditor
   npm install
   cd backend
   node server.js
   cd frontend
   npm run dev
   ```
### HOW TO USE
### Create a Room:
Click on the "Create Room" button to generate a unique room ID. Share the room ID with collaborators.

### Join a Room:
Enter a valid room ID to join an existing collaboration space.

### Upload a File:
Upload an image (e.g., Figma export) for live reference. The image is visible to all participants in the room.

### Code Together:
Use the code editor to write and edit HTML, CSS, and JavaScript.
See the changes live in the preview pane.

### Annotate Designs:
Use the pencil tool to draw annotations.
Use the eraser tool to remove unnecessary annotations.

### Example Scenarios
Interview Preparation:
Interviewers can upload a design and watch candidates code it live.

Frontend Collaboration:
Developers can work together on a webpage or UI component in real time.


   


