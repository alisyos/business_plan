'use client';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin';

  return (
    <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 0' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', margin: '0' }}>
              {isAdminPage ? '프롬프트 관리' : 'AI 사업계획서 생성기'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', fontWeight: 'normal', margin: '0.25rem 0 0 0' }}>
              {isAdminPage ? '시스템 프롬프트를 확인하고 수정할 수 있습니다.' : '입력한 사업아이템 정보를 기반으로 사업계획서를 제공합니다.'}
            </p>
          </div>
          {!isAdminPage ? (
            <a 
              href="/admin" 
              className="admin-link"
              style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                textDecoration: 'underline',
                transition: 'color 0.2s'
              }}
            >
              관리자 페이지
            </a>
          ) : (
            <a 
              href="/" 
              style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                textDecoration: 'underline',
                transition: 'color 0.2s'
              }}
              className="admin-link"
            >
              메인 페이지로
            </a>
          )}
        </div>
      </div>
    </header>
  );
} 