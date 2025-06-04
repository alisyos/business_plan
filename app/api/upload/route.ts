import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '파일이 선택되지 않았습니다.'
      }, { status: 400 });
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: '파일 크기가 5MB를 초과합니다.'
      }, { status: 400 });
    }

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    const isTextFile = fileName.endsWith('.txt');
    const isDocxFile = fileName.endsWith('.docx');
    const isDocFile = fileName.endsWith('.doc');

    if (!isTextFile && !isDocxFile && !isDocFile) {
      return NextResponse.json({
        success: false,
        error: '지원하지 않는 파일 형식입니다. (txt, docx 파일만 가능)'
      }, { status: 400 });
    }

    // .doc 파일은 지원하지 않음
    if (isDocFile) {
      return NextResponse.json({
        success: false,
        error: '구 버전 Word 파일(.doc)은 지원되지 않습니다. .docx 형식으로 저장한 후 다시 업로드해주세요.'
      }, { status: 400 });
    }

    // 파일 내용 읽기
    const arrayBuffer = await file.arrayBuffer();
    let content = '';

    if (isTextFile) {
      // 텍스트 파일 처리
      content = new TextDecoder('utf-8').decode(arrayBuffer);
    } else if (isDocxFile) {
      // .docx 파일 처리
      try {
        // ArrayBuffer를 Buffer로 변환
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        
        if (result.messages && result.messages.length > 0) {
          console.log('Word 문서 처리 메시지:', result.messages);
        }
      } catch (error) {
        console.error('Word 문서 처리 오류:', error);
        return NextResponse.json({
          success: false,
          error: 'Word 문서를 처리하는 중 오류가 발생했습니다. 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.'
        }, { status: 400 });
      }
    }

    // 내용이 비어있는지 확인
    if (!content.trim()) {
      return NextResponse.json({
        success: false,
        error: '파일 내용이 비어있습니다.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        content: content.trim(),
        filename: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json({
      success: false,
      error: '파일 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 