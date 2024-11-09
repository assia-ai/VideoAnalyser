export interface Scene {
  timestamp: string;
  description: string;
  selected?: boolean;
  frameUrl?: string;
}

export interface VideoFile extends File {
  preview?: string;
}