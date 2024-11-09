import { useState } from 'react';
import { Scene, VideoFile } from '../types';
import { extractFrames, generateVideo } from '../utils/videoProcessor';

export function useVideoProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([]);

  const analyzeVideos = async (videos: VideoFile[]) => {
    setIsProcessing(true);
    setProgress(0);
    const allScenes: Scene[] = [];

    try {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const frames = await extractFrames(video, 2000); // Increased interval to 2 seconds
        
        frames.forEach((frameUrl, index) => {
          const seconds = index * 2; // Adjust for 2-second interval
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          const timestamp = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
          
          allScenes.push({
            timestamp,
            description: `Scene from ${video.name} at ${timestamp}`,
            frameUrl,
          });
        });

        setProgress(((i + 1) / videos.length) * 100);
      }

      setScenes(allScenes);
    } catch (error) {
      console.error('Error processing videos:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
    
    return allScenes;
  };

  const createCompilation = async (selectedScenes: Scene[]) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const videoBlob = await generateVideo(selectedScenes, (progress) => {
        setProgress(progress);
      });
      return URL.createObjectURL(videoBlob);
    } catch (error) {
      console.error('Error creating compilation:', error);
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    isProcessing,
    progress,
    scenes,
    analyzeVideos,
    createCompilation,
  };
}