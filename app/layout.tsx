import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 사업계획서 생성기',
  description: 'OpenAI API를 활용한 사업계획서 자동 생성 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <header className="header">
          <div className="container">
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>AI 사업계획서 생성기</h1>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', fontWeight: 'normal' }}>
                  입력한 사업아이템 정보를 기반으로 사업계획서를 제공합니다.
                </p>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Powered by OpenAI
              </div>
            </div>
          </div>
        </header>
        
        <main style={{ paddingTop: '2rem', minHeight: 'calc(100vh - 140px)' }}>
          {children}
        </main>
        
        <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', marginTop: '4rem', padding: '1.5rem 0' }}>
          <div className="container">
            <div className="text-center" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              © 2024 AI 사업계획서 생성기. OpenAI API를 활용한 서비스입니다.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 