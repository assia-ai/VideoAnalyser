import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';

interface Scene {
  timestamp: string;
  description: string;
  selected?: boolean;
}

interface AnalysisResultsProps {
  results: Scene[];
  onSceneSelect?: (selectedScenes: Scene[]) => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, onSceneSelect }) => {
  const [scenes, setScenes] = useState<Scene[]>(results);

  const toggleSceneSelection = (index: number) => {
    const updatedScenes = scenes.map((scene, i) => 
      i === index ? { ...scene, selected: !scene.selected } : scene
    );
    setScenes(updatedScenes);
    onSceneSelect?.(updatedScenes.filter(scene => scene.selected));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Analyzed Scenes</h3>
      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-colors ${
              scene.selected 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {scene.timestamp}
                  </span>
                </div>
                <p className="text-gray-600">{scene.description}</p>
              </div>
              <button
                onClick={() => toggleSceneSelection(index)}
                className={`ml-4 p-2 rounded-full transition-colors ${
                  scene.selected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalysisResults;