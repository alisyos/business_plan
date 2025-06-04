import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessPlan } from '@/lib/openai';
import { BusinessPlanInputs, ApiResponse, BusinessPlanResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titleStructure, content, tone }: BusinessPlanInputs = body;

    // 입력값 검증
    if (!titleStructure || !tone) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '필수 항목이 누락되었습니다.'
      }, { status: 400 });
    }

    // OpenAI API 호출
    const result = await generateBusinessPlan({
      titleStructure,
      content: content || {}, // content가 없으면 빈 객체로 처리
      tone
    });

    return NextResponse.json<ApiResponse<BusinessPlanResponse>>({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('사업계획서 생성 오류:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '사업계획서 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
    }, { status: 500 });
  }
} 