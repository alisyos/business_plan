export interface OutlineRequest {
  content: string;
}

export interface OutlineInputs {
  businessItem: string;
  businessDescription: string;
  tone: string;
}

export interface OutlineResponse {
  title: string;
  structure: Array<{
    heading: string;
    subheadings?: string[];
  }>;
}

export interface BusinessPlanRequest {
  outline: string;
}

export interface BusinessPlanInputs {
  titleStructure: any;
  content: any;
  tone: string;
}

export interface BusinessPlanResponse {
  title: string;
  report: Array<{
    heading: string;
    content?: string[];
    sections?: Array<{
      subheading: string;
      content: string[];
    }>;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 프롬프트 관리 관련 타입
export interface PromptData {
  id: string;
  name: string;
  description: string;
  content: string;
  updatedAt: string;
}

export interface PromptsCollection {
  outline: PromptData;
  businessPlan: PromptData;
}



export interface UpdatePromptRequest {
  promptId: string;
  content: string;
} 