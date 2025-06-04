import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { PromptsCollection, UpdatePromptRequest } from '../../../../types';

const PROMPTS_FILE_PATH = path.join(process.cwd(), 'data', 'prompts.json');

// 프롬프트 파일 읽기
async function readPrompts(): Promise<PromptsCollection> {
  try {
    const fileContent = await fs.readFile(PROMPTS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading prompts file:', error);
    throw new Error('프롬프트 파일을 읽을 수 없습니다.');
  }
}

// 프롬프트 파일 저장
async function savePrompts(prompts: PromptsCollection): Promise<void> {
  try {
    await fs.writeFile(PROMPTS_FILE_PATH, JSON.stringify(prompts, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving prompts file:', error);
    throw new Error('프롬프트 파일을 저장할 수 없습니다.');
  }
}

// GET: 모든 프롬프트 조회
export async function GET() {
  try {
    const prompts = await readPrompts();
    return NextResponse.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    return NextResponse.json(
      { success: false, error: '프롬프트를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 프롬프트 업데이트
export async function PUT(request: Request) {
  try {
    const { promptId, content }: UpdatePromptRequest = await request.json();

    if (!promptId || !content) {
      return NextResponse.json(
        { success: false, error: '프롬프트 ID와 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const prompts = await readPrompts();
    
    if (promptId !== 'outline' && promptId !== 'businessPlan') {
      return NextResponse.json(
        { success: false, error: '올바르지 않은 프롬프트 ID입니다.' },
        { status: 400 }
      );
    }

    // 프롬프트 업데이트
    prompts[promptId].content = content;
    prompts[promptId].updatedAt = new Date().toISOString();

    await savePrompts(prompts);

    return NextResponse.json({
      success: true,
      data: prompts[promptId]
    });
  } catch (error) {
    console.error('Update prompt error:', error);
    return NextResponse.json(
      { success: false, error: '프롬프트를 업데이트할 수 없습니다.' },
      { status: 500 }
    );
  }
} 