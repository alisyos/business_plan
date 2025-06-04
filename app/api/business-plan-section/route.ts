import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessPlanSection } from '@/lib/openai';
import { ApiResponse } from '@/types';

interface BusinessPlanSectionRequest {
  titleStructure: any;
  sectionIndex: number;
  tone: string;
  content?: Record<string, any>;
}

interface BusinessPlanSectionResponse {
  section: any;
  isComplete: boolean;
  nextSectionIndex?: number;
}

export async function POST(request: NextRequest) {
  console.log('사업계획서 섹션 생성 요청 시작');
  
  try {
    const body = await request.json();
    const { titleStructure, sectionIndex, tone, content }: BusinessPlanSectionRequest = body;

    // 입력값 검증
    if (!titleStructure || typeof sectionIndex !== 'number' || !tone) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '필수 항목이 누락되었습니다.'
      }, { status: 400 });
    }

    const sections = titleStructure.structure;
    if (sectionIndex >= sections.length) {
      return NextResponse.json<ApiResponse<BusinessPlanSectionResponse>>({
        success: true,
        data: {
          section: null,
          isComplete: true
        }
      });
    }

    console.log(`섹션 ${sectionIndex + 1}/${sections.length} 생성 시작`);
    
    // 개별 섹션 생성
    const section = await generateBusinessPlanSection({
      title: titleStructure.title,
      currentSection: sections[sectionIndex],
      tone,
      content: content || {}
    });

    console.log(`섹션 ${sectionIndex + 1} 생성 완료`);

    const isComplete = sectionIndex >= sections.length - 1;
    const nextSectionIndex = isComplete ? undefined : sectionIndex + 1;

    return NextResponse.json<ApiResponse<BusinessPlanSectionResponse>>({
      success: true,
      data: {
        section,
        isComplete,
        nextSectionIndex
      }
    });

  } catch (error) {
    console.error('사업계획서 섹션 생성 오류:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '사업계획서 섹션 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
    }, { status: 500 });
  }
} 