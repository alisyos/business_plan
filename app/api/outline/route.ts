import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '../../../lib/openai';
import { OutlineInputs, ApiResponse, OutlineResponse } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessItem, businessDescription, tone }: OutlineInputs = body;

    // 입력값 검증
    if (!businessItem || !businessDescription || !tone) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '모든 필수 항목을 입력해주세요.'
      }, { status: 400 });
    }

    // OpenAI API 호출
    const result = await generateOutline({
      businessItem,
      businessDescription,
      tone
    });

    return NextResponse.json<ApiResponse<OutlineResponse>>({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('목차 생성 오류:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '목차 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
    }, { status: 500 });
  }
} 