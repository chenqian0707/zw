
export interface PalaceData {
  name: string;
  mainStars: string[];
  minorStars: string[];
  interpretation: string;
}

export interface DecadeCycle {
  period: string; // e.g., "16-25岁" or "2024-2033"
  palaceName: string; // e.g., "命宫" or "大限命宫"
  summary: string;
}

export interface YearlyCycle {
  year: string; // e.g., "2024 甲辰年"
  summary: string;
  keyPoints: string[];
}

export interface ChartAnalysis {
  personalInfo: {
    birthDate: string;
    gender: string;
    mingZhu: string;
    shenZhu: string;
  };
  summary: string;
  fortuneCycle: string;
  decadeCycles: DecadeCycle[];
  yearlyCycles: YearlyCycle[];
  palaces: PalaceData[];
  careerAdvice: string;
  wealthAdvice: string;
  relationshipAdvice: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
