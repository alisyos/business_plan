import type { Metadata } from 'next'
import Header from '../components/Header'
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
        <Header />
        
        <main style={{ paddingTop: '2rem', minHeight: 'calc(100vh - 140px)' }}>
          {children}
        </main>
        
        <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', marginTop: '4rem', padding: '1.5rem 0' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              © 2024 AI 사업계획서 생성기. OpenAI API를 활용한 서비스입니다.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 