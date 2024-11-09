import { Scene } from '../types';

const DEFAULT_MUSIC_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

export async function extractFrames(video: File, interval: number = 2000): Promise<string[]> {
  return new Promise((resolve) => {
    const frames: string[] = [];
    const videoElement = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true })!;

    videoElement.src = URL.createObjectURL(video);
    videoElement.onloadedmetadata = () => {
      // Reduce resolution for better performance
      const scale = 0.5;
      canvas.width = videoElement.videoWidth * scale;
      canvas.height = videoElement.videoHeight * scale;
      
      let currentTime = 0;
      const duration = videoElement.duration * 1000;

      const captureFrame = () => {
        if (currentTime <= duration) {
          videoElement.currentTime = currentTime / 1000;
          videoElement.onseeked = () => {
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.8));
            currentTime += interval;
            captureFrame();
          };
        } else {
          URL.revokeObjectURL(videoElement.src);
          resolve(frames);
        }
      };

      captureFrame();
    };
  });
}

async function loadAudio(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
}

export async function generateVideo(
  scenes: Scene[], 
  onProgress: (progress: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  const audioContext = new AudioContext();
  
  const stream = canvas.captureStream(30); // Reduced to 30fps
  const audioDestination = audioContext.createMediaStreamDestination();
  stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm',
    videoBitsPerSecond: 2500000 // Reduced bitrate
  });
  
  const chunks: Blob[] = [];
  const TRANSITION_FRAMES = 15; // Reduced transition frames
  const FRAMES_PER_SECOND = 30;
  const SECONDS_PER_SCENE = 3;
  const framesPerScene = FRAMES_PER_SECOND * SECONDS_PER_SCENE;
  
  // Pre-load all images and audio
  const [loadedImages, audioBuffer] = await Promise.all([
    Promise.all(
      scenes.map(scene => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = scene.frameUrl!;
        });
      })
    ),
    loadAudio(DEFAULT_MUSIC_URL)
  ]);

  return new Promise((resolve) => {
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: 'video/webm' });
      resolve(finalBlob);
    };

    // Set canvas size (720p for better performance)
    canvas.width = 1280;
    canvas.height = 720;

    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioDestination);
    audioSource.start();

    mediaRecorder.start();

    let currentFrame = 0;
    const totalFrames = scenes.length * framesPerScene;
    
    const renderFrame = () => {
      const sceneIndex = Math.floor(currentFrame / framesPerScene);
      
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      // Update progress
      onProgress((currentFrame / totalFrames) * 100);

      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const frameInScene = currentFrame % framesPerScene;
      const currentImage = loadedImages[sceneIndex];
      const nextImage = loadedImages[sceneIndex + 1];

      let opacity = 1;
      if (frameInScene >= framesPerScene - TRANSITION_FRAMES && nextImage) {
        opacity = 1 - (frameInScene - (framesPerScene - TRANSITION_FRAMES)) / TRANSITION_FRAMES;
      }

      if (currentImage) {
        context.globalAlpha = opacity;
        const progress = frameInScene / framesPerScene;
        const scale = 1 + (progress * 0.05); // Reduced zoom effect
        
        const ratio = Math.min(
          canvas.width / currentImage.width,
          canvas.height / currentImage.height
        ) * scale;
        
        const centerX = (canvas.width - currentImage.width * ratio) / 2;
        const centerY = (canvas.height - currentImage.height * ratio) / 2;

        const panX = Math.sin(progress * Math.PI) * 30; // Reduced pan effect
        
        context.drawImage(
          currentImage,
          centerX + panX,
          centerY,
          currentImage.width * ratio,
          currentImage.height * ratio
        );

        if (frameInScene >= framesPerScene - TRANSITION_FRAMES && nextImage) {
          context.globalAlpha = 1 - opacity;
          const nextRatio = Math.min(
            canvas.width / nextImage.width,
            canvas.height / nextImage.height
          );
          const nextCenterX = (canvas.width - nextImage.width * nextRatio) / 2;
          const nextCenterY = (canvas.height - nextImage.height * nextRatio) / 2;

          context.drawImage(
            nextImage,
            nextCenterX,
            nextCenterY,
            nextImage.width * nextRatio,
            nextImage.height * nextRatio
          );
        }

        // Add timestamp overlay
        context.globalAlpha = 1;
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(10, canvas.height - 40, 100, 30);
        context.fillStyle = '#fff';
        context.font = '16px Arial';
        context.fillText(scenes[sceneIndex].timestamp, 20, canvas.height - 20);
      }

      context.globalAlpha = 1;
      currentFrame++;
      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  });
}