import React, { useState } from 'react';
import { Film, Loader2, Scissors } from 'lucide-react';
import VideoUploader from './components/VideoUploader';
import AnalysisResults from './components/AnalysisResults';
import FinalVideo from './components/FinalVideo';
import { Scene, VideoFile } from './types';
import { useVideoProcessing } from './hooks/useVideoProcessing';

function App() {
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<Scene[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string>('');
  
  const {
    isProcessing,
    progress,
    scenes,
    analyzeVideos,
    createCompilation
  } = useVideoProcessing();

  const handleVideoUpload = (files: VideoFile[]) => {
    setUploadedVideos(prev => [...prev, ...files].slice(0, 3));
    setSelectedScenes([]);
    setFinalVideoUrl('');
  };

  const handleAnalyze = async () => {
    await analyzeVideos(uploadedVideos);
  };

  const handleSceneSelect = (scenes: Scene[]) => {
    setSelectedScenes(scenes);
  };

  const handleGenerateVideo = async () => {
    if (selectedScenes.length === 0) return;
    const videoUrl = await createCompilation(selectedScenes);
    if (videoUrl) {
      setFinalVideoUrl(videoUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            Browser Video Scene Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Process videos directly in your browser and create custom compilations
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <VideoUploader 
            onUpload={handleVideoUpload} 
            uploadedVideos={uploadedVideos}
            maxVideos={3}
          />

          {uploadedVideos.length > 0 && (
            <div className="mt-8">
              <button
                onClick={handleAnalyze}
                disabled={isProcessing || uploadedVideos.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Videos... {progress.toFixed(0)}%
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5" />
                    Analyze Scenes
                  </>
                )}
              </button>
            </div>
          )}

          {scenes.length > 0 && (
            <>
              <AnalysisResults 
                results={scenes}
                onSceneSelect={handleSceneSelect}
              />
              
              {selectedScenes.length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Video... {progress.toFixed(0)}%
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5" />
                        Generate Compilation
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {finalVideoUrl && (
            <FinalVideo videoUrl={finalVideoUrl} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;