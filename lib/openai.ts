import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';
import { OutlineInputs, OutlineResponse, BusinessPlanInputs, BusinessPlanResponse, PromptsCollection } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 프롬프트 파일 경로
const PROMPTS_FILE_PATH = path.join(process.cwd(), 'data', 'prompts.json');

// 프롬프트 로딩 함수
async function loadPrompts(): Promise<PromptsCollection> {
  try {
    const fileContent = await fs.readFile(PROMPTS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading prompts:', error);
    throw new Error('프롬프트 파일을 로드할 수 없습니다.');
  }
}

export async function generateOutline(inputs: OutlineInputs): Promise<OutlineResponse> {
  // 동적으로 프롬프트 로딩
  const prompts = await loadPrompts();
  const prompt = prompts.outline.content
    .replace('{{businessItem}}', inputs.businessItem)
    .replace('{{businessDescription}}', inputs.businessDescription);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000,
  }, {
    timeout: 60000,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI API returned empty response');
  }

  console.log('Outline API Response:', content);

  try {
    // JSON 부분만 추출 시도
    let jsonContent = content.trim();
    
    // JSON이 ```json으로 감싸져 있는 경우 처리
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // { } 사이의 내용만 추출
      const braceMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonContent = braceMatch[0];
      }
    }
    
    return JSON.parse(jsonContent) as OutlineResponse;
  } catch (error) {
    console.error('Failed to parse outline response as JSON:', content);
    throw new Error(`Failed to parse OpenAI response as JSON: ${error}`);
  }
}

export async function generateBusinessPlan(inputs: BusinessPlanInputs): Promise<BusinessPlanResponse> {
  // 동적으로 프롬프트 로딩
  const prompts = await loadPrompts();
  const prompt = prompts.businessPlan.content
    .replace('{{titleStructure}}', JSON.stringify(inputs.titleStructure))
    .replace('{{content}}', JSON.stringify(inputs.content))
    .replace('{{tone}}', inputs.tone);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  }, {
    timeout: 120000,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI API returned empty response');
  }

  console.log('Business Plan API Response:', content);

  try {
    // JSON 부분만 추출 시도
    let jsonContent = content.trim();
    
    // JSON이 ```json으로 감싸져 있는 경우 처리
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // { } 사이의 내용만 추출
      const braceMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonContent = braceMatch[0];
      }
    }
    
    return JSON.parse(jsonContent) as BusinessPlanResponse;
  } catch (error) {
    console.error('Failed to parse business plan response as JSON:', content);
    throw new Error(`Failed to parse OpenAI response as JSON: ${error}`);
  }
} 