# Frontend Dev Collaboration Platform

A real-time collaboration platform designed for frontend developers and interview scenarios. The project allows users to upload design files (e.g., Figma exports, images) and collaboratively code the frontend live with a dynamic preview.

---

## 🚀 Features

### Real-Time Collaboration
- **Socket.IO** enables seamless real-time updates for both the code editor and the uploaded images.

### Room-Based Functionality
- Users can **create rooms** for isolated collaboration or **join existing rooms** to work together on the same codebase.

### File Upload and Rendering
- Upload design files (e.g., images) to guide the development process.
- Uploaded files are shared with all participants in the room.

### Live Code Preview
- A built-in **CodeMirror editor** with support for:
  - HTML (via `@codemirror/lang-html`)
  - Dark theme (`@uiw/codemirror-theme-github`)
- Instant live preview using an `iframe`.

### Developer-Friendly UI
- Styled with **Tailwind CSS** for a clean, modern, and responsive interface.

---

## 🛠️ Technologies Used

### Backend
- **Node.js**: Server-side JavaScript runtime.
- **Express**: Handles HTTP requests and static file serving.
- **Socket.IO**: Enables real-time bidirectional communication.
- **Multer**: Handles file uploads on the server.
- **FS Module**: Reads and shares uploaded image files.

### Frontend
- **React**: Component-based library for the user interface.
- **Socket.IO Client**: Connects to the real-time server.
- **CodeMirror**: A versatile in-browser code editor for HTML/CSS/JS.
- **Tailwind CSS**: Provides utility-first styling for a polished look.

---

## 📦 Installation and Setup

### Prerequisites
- Node.js and npm installed.

### Steps
   ```bash
   git clone https://github.com/varruunnn/RealTimeCodeEditor.git
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

### Example Scenarios
Interview Preparation:
Interviewers can upload a design and watch candidates code it live.

Frontend Collaboration:
Developers can work together on a webpage or UI component in real time.


   


