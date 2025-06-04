import { NextResponse } from 'next/server';
import type { AdminAuthRequest } from '../../../../types';

// 간단한 관리자 비밀번호 (실제 환경에서는 환경변수 사용)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: Request) {
  try {
    const { password }: AdminAuthRequest = await request.json();

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        data: { authenticated: true }
      });
    } else {
      return NextResponse.json(
        { success: false, error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { success: false, error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 