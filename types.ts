export interface OutlineRequest {
  content: string;
}

export interface OutlineInputs {
  businessItem: string;
  businessDescription: string;
}

export interface OutlineResponse {
  outline: string;
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
  businessPlan: string;
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