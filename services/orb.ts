export interface AudioAnalyser {
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  bufferLength: number;
}

export interface OrbProps {
  audioContext?: AudioContext | null;
  isAudioPlaying: boolean;
  size?: number;
  breathingSpeed?: number;
}

export interface OrbState {
  isActive: boolean;
  breathPhase: number;
  audioData: number[];
  audioIntensity: number;
}

export type ColorPalette = {
  orange: string;
  gold: string;
  blue: string;
  white: string;
  black: string;
};