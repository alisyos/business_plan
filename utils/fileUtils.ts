import { FileUpload } from '@/types';

// 파일 타입 검증
export function validateFileType(file: FileUpload): boolean {
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(file.mimetype);
}

// 파일 크기 검증 (5MB 제한)
export function validateFileSize(file: FileUpload): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
}

// 파일에서 텍스트 추출 (기본 구현)
export async function extractTextFromFile(file: FileUpload): Promise<string> {
  if (file.mimetype === 'text/plain') {
    return file.buffer.toString('utf-8');
  }
  
  // PDF나 Word 파일의 경우 실제 프로덕션에서는 
  // pdf-parse, mammoth 등의 라이브러리를 사용해야 합니다
  throw new Error('PDF 및 Word 파일 처리는 추후 구현 예정입니다.');
}

// 파일 검증 통합 함수
export function validateFile(file: FileUpload): { isValid: boolean; error?: string } {
  if (!validateFileType(file)) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 형식입니다. (txt, pdf, doc, docx만 가능)'
    };
  }
  
  if (!validateFileSize(file)) {
    return {
      isValid: false,
      error: '파일 크기가 5MB를 초과합니다.'
    };
  }
  
  return { isValid: true };
} 