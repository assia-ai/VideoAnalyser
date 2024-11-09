import React, { useRef, useState } from 'react';
import { Play, Download, Volume2, VolumeX } from 'lucide-react';

interface FinalVideoProps {
  videoUrl: string;
}

const FinalVideo: React.FC<FinalVideoProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  const handlePreview = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `compilation-${new Date().getTime()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="mt-8 border rounded-lg overflow-hidden bg-gray-900">
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-4">Final Compilation</h3>
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            src={videoUrl}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end gap-4">
        <button 
          onClick={handlePreview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};

export default FinalVideo;