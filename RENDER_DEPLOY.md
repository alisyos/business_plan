# Render 배포 가이드

## 1. Render 계정 생성
[Render](https://render.com/)에서 계정을 생성하고 GitHub과 연결합니다.

## 2. 새 Web Service 생성

1. Render 대시보드에서 "New +" 버튼 클릭
2. "Web Service" 선택
3. GitHub 리포지토리 연결: `https://github.com/alisyos/business_plan`

## 3. 서비스 설정

### 기본 설정
- **Name**: `business-plan-generator`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` 또는 가장 가까운 지역
- **Branch**: `main`

### 빌드 & 배포 설정
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: `18`

### 환경 변수 설정
다음 환경 변수들을 추가하세요:

| Key | Value | 설명 |
|-----|-------|------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API 키 |
| `NODE_ENV` | `production` | 프로덕션 환경 |

## 4. 배포 완료

"Create Web Service" 버튼을 클릭하면 배포가 시작됩니다.
첫 배포는 5-10분 정도 소요될 수 있습니다.

## Render의 장점

- **더 긴 실행 시간**: 무료 플랜에서도 더 관대한 타임아웃 설정
- **안정적인 API 호출**: OpenAI API 같은 긴 처리 시간이 필요한 작업에 적합
- **무료 플랜**: 매월 750시간 무료 사용 