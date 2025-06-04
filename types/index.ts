// 1단계: 목차 생성 관련 타입들
export interface OutlineInputs {
  businessItem: string;
  businessDescription: string;
  tone: 'formal' | 'friendly' | 'professional';
}

export interface Subheading {
  text: string;
}

export interface OutlineStructure {
  heading: string;
  subheadings?: string[];
}

export interface OutlineResponse {
  title: string;
  structure: OutlineStructure[];
}

// 2단계: 사업계획서 생성 관련 타입들
export interface ReportSection {
  subheading: string;
  content: string[];
}

export interface ReportItem {
  heading: string;
  sections?: ReportSection[];
  content?: string[];
}

export interface BusinessPlanResponse {
  title: string;
  report: ReportItem[];
}

// 사업계획서 생성 입력 타입
export interface BusinessPlanInputs {
  titleStructure: OutlineResponse;
  content: Record<string, string>;
  tone: 'formal' | 'friendly' | 'professional';
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 파일 업로드 타입
export interface FileUpload {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
} 