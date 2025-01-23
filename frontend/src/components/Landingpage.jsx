import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, Users, Paintbrush, Zap,
  MonitorPlay, Lock, Clock, CodepenIcon,
  ChevronRight, Github, Twitter
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const handleGetStarted = (plan = 'free') => {
    navigate('/editor', { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="w-8 h-8 text-blue-500" />
              <span className="font-bold text-xl">RealTimeEditor</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://github.com/varruunnn/RealTimeEditor" target="_blank" rel="noopener noreferrer" 
                className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Collaborative Code Editor for
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> Modern Teams</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Real-time collaborative coding platform for frontend developers and technical interviews.
            Share designs, code together, and annotate in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <button 
              onClick={() => handleGetStarted('free')}
              className="group bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Learn more →
            </a>
          </div>
        </div>
      </div>
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Everything you need for seamless collaboration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Code2 className="w-6 h-6" />, title: "Live Code Editor", desc: "Powerful CodeMirror editor with syntax highlighting and GitHub theme" },
            { icon: <Users className="w-6 h-6" />, title: "Real-time Collaboration", desc: "Code together with your team in perfect sync" },
            { icon: <Paintbrush className="w-6 h-6" />, title: "Design Annotations", desc: "Draw, highlight, and comment directly on designs" },
            { icon: <MonitorPlay className="w-6 h-6" />, title: "Live Preview", desc: "See your changes instantly with live preview" },
            { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "Powered by Socket.IO for instant updates" },
            { icon: <Lock className="w-6 h-6" />, title: "Secure Rooms", desc: "Private rooms with unique IDs for your team" },
            { icon: <Clock className="w-6 h-6" />, title: "Persistent State", desc: "Your work stays intact across sessions" },
            { icon: <CodepenIcon className="w-6 h-6" />, title: "Technical Interviews", desc: "Perfect for conducting coding interviews" }
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer border border-transparent hover:border-blue-500/20"
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`text-blue-500 mb-4 transform transition-transform duration-200 ${hoveredFeature === i ? 'scale-110' : ''}`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
