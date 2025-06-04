import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessPlan } from '@/lib/openai';
import { BusinessPlanInputs, ApiResponse, BusinessPlanResponse } from '@/types';

export async function POST(request: NextRequest) {
  console.log('사업계획서 생성 요청 시작');
  
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

    console.log('OpenAI API 호출 시작');
    
    // OpenAI API 호출
    const result = await generateBusinessPlan({
      titleStructure,
      content: content || {}, // content가 없으면 빈 객체로 처리
      tone
    });

    console.log('사업계획서 생성 완료');

    return NextResponse.json<ApiResponse<BusinessPlanResponse>>({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('사업계획서 생성 오류:', error);
    
    // 타임아웃 에러 특별 처리
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('Gateway Timeout'))) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '사업계획서 생성이 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 504 });
    }
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '사업계획서 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
    }, { status: 500 });
  }
} 