import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoUploaderProps {
  onUpload: (files: VideoFile[]) => void;
  uploadedVideos: VideoFile[];
  maxVideos: number;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onUpload, 
  uploadedVideos, 
  maxVideos 
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files)
      .filter(file => file.type.startsWith('video/'))
      .map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })) as VideoFile[];
    onUpload(files);
  }, [onUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      ) as VideoFile[];
      onUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors"
      >
        <Upload className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Drop your videos here</h3>
        <p className="text-gray-500 mb-4">or</p>
        <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer">
          Browse Files
          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">
          {uploadedVideos.length}/{maxVideos} videos uploaded
        </p>
      </div>

      {uploadedVideos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploadedVideos.map((video, index) => (
            <div
              key={index}
              className="relative bg-gray-50 rounded-lg overflow-hidden"
            >
              <video
                src={video.preview}
                className="w-full aspect-video object-cover"
                controls
              />
              <div className="p-2">
                <p className="text-sm text-gray-700 truncate">{video.name}</p>
                <p className="text-xs text-gray-500">
                  {(video.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;