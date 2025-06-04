# AI 사업계획서 생성기

OpenAI API를 활용하여 사용자 입력을 기반으로 사업계획서를 자동 생성하는 웹 애플리케이션입니다.

## 주요 기능

### 통합 인터페이스
- **좌우 분할 레이아웃**: 좌측 입력(1/3), 우측 결과(2/3) 영역으로 구성
- **실시간 피드백**: 입력과 동시에 결과를 확인할 수 있는 직관적인 인터페이스
- **탭 기반 결과 표시**: 목차와 사업계획서를 탭으로 구분하여 표시

### 입력 영역 (좌측)
- **사업 아이템 입력**: 핵심 사업 아이템 요약
- **사업 설명**: 직접 입력 또는 파일 업로드 지원 (.txt, .docx)
- **톤/스타일 선택**: 격식체, 친근한, 전문적 중 선택
- **원클릭 생성**: 목차 생성 및 사업계획서 생성 버튼

### 결과 영역 (우측)
- **목차 탭**: 
  - AI가 생성한 목차 구조 표시
  - 제목, 대제목, 소제목 실시간 편집
  - 소제목 추가/삭제 기능
  - 최종 목차 미리보기
- **사업계획서 탭**:
  - 완성된 사업계획서 전체 내용 표시
  - 구조화된 섹션별 내용 표시
  - 다운로드 및 복사 기능

### 파일 업로드 지원
- **지원 형식**: 텍스트 파일(.txt), Word 문서(.docx)
- **최대 크기**: 5MB
- **자동 처리**: 업로드된 파일 내용을 자동으로 추출하여 사업 설명으로 활용

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Custom CSS (Tailwind CSS에서 변경)
- **AI**: OpenAI GPT-4 API
- **파일 처리**: mammoth (Word 문서 처리)
- **Deployment**: Vercel Ready

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd business_plan
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp env.example .env.local
```

`.env.local` 파일을 열고 OpenAI API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조

```
business_plan/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── outline/       # 목차 생성 API
│   │   ├── business-plan/ # 사업계획서 생성 API
│   │   └── upload/        # 파일 업로드 API
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 통합 메인 페이지
├── lib/                   # 라이브러리
│   └── openai.ts         # OpenAI API 클라이언트
├── types/                 # TypeScript 타입 정의
│   └── index.ts
├── utils/                 # 유틸리티 함수
│   └── fileUtils.ts
└── package.json
```

## API 엔드포인트

### POST /api/outline
목차 생성 API
- **입력**: businessItem, businessDescription, tone
- **출력**: title, structure (heading, subheadings)

### POST /api/business-plan
사업계획서 생성 API
- **입력**: titleStructure, content, tone
- **출력**: title, report (heading, sections/content)

### POST /api/upload
파일 업로드 API
- **입력**: FormData (file)
- **지원 형식**: .txt, .docx
- **출력**: 추출된 텍스트 내용

## 배포

### Vercel 배포
1. Vercel 계정에 프로젝트 연결
2. 환경 변수 설정 (OPENAI_API_KEY)
3. 자동 배포 완료

```bash
npm run build
```

## 사용 방법

### 1. 정보 입력 (좌측 영역)
- **사업 아이템**: 핵심 사업 아이템을 간단히 요약 입력
- **사업 설명**: 직접 입력하거나 기획서/아이디어 노트 파일 업로드
- **톤/스타일**: 원하는 문서 스타일 선택

### 2. 목차 생성 및 편집 (우측 목차 탭)
- "목차 생성" 버튼 클릭
- 생성된 목차를 실시간으로 편집
- 제목, 대제목, 소제목 수정 가능
- 소제목 추가/삭제 가능

### 3. 사업계획서 생성 (우측 사업계획서 탭)
- "사업계획서 생성" 버튼 클릭
- AI가 목차를 바탕으로 완전한 사업계획서 자동 생성
- 구조화된 내용을 섹션별로 확인

### 4. 결과 활용
- **다운로드**: 텍스트 파일로 저장
- **복사**: 클립보드로 복사하여 다른 문서에 붙여넣기
- **새로 시작**: 처음부터 다시 작성

## 시스템 특징

### 개선된 사용자 경험
- **단일 페이지**: 모든 기능이 하나의 페이지에서 작동
- **실시간 편집**: 목차를 생성 후 즉시 편집 가능
- **자동 상태 관리**: 각 단계별 로딩 상태 및 오류 처리
- **직관적 네비게이션**: 탭을 통한 쉬운 결과 확인

### 파일 처리 개선
- **Word 문서 지원**: .docx 파일의 텍스트 자동 추출
- **안정적인 업로드**: 파일 형식 및 크기 검증
- **미리보기**: 업로드된 파일 내용 확인 가능

## 주의사항

- OpenAI API 키가 필요합니다.
- API 사용량에 따라 비용이 발생할 수 있습니다.
- 생성된 내용은 참고용이며, 실제 사업계획서 작성 시 검토가 필요합니다.
- 파일 업로드는 최대 5MB까지 지원됩니다.

## 라이선스

ISC License

## 기여

버그 리포트나 기능 제안은 이슈를 통해 제출해 주세요. 