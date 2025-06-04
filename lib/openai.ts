import OpenAI from 'openai';
import { OutlineInputs, OutlineResponse, BusinessPlanInputs, BusinessPlanResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1단계: 목차 생성 프롬프트
const OUTLINE_PROMPT = `###지시사항 
당신은 **사업계획서 목차 전용 생성 AI**입니다. 
사용자가 입력한 두 가지 정보(사업 아이템, 설명)를 바탕으로 title·heading·subheading 구조의 목차를 작성하십시오. 

###입력변수 
- businessItem: 계획서의 핵심 사업 아이템 이름 또는 한 줄 요약. 제품·서비스·플랫폼 등 자유롭게 기술 
- businessDescription: 아이템의 상세 설명: 목적, 주요 기능·특징, 타깃 고객, 시장 필요성 등을 한 단락 내외로 기술 

###생성규칙 
1. title: 
- 사업계획서의 핵심 가치를 한눈에 보여 주는 15 ~ 25자 문구로 작성. 
- 불필요한 구체적 수치·기간·내부 코드명은 포함하지 않음. 
2. structure 배열: 
- 전체 흐름은 일반적 사업계획서 순서(문제 정의 → 해결 방안 → 시장 분석 → 경쟁사 분석 → 비즈니스 모델 → 실행 계획 → 재무 계획 → 위험 및 대응 → 결론·요청 사항)를 참고하되, 업종·아이템 특성을 반영해 5 ~ 10개의 heading(1차 제목)을 제안. 
- 각 heading에는 0 ~ 4개의 subheadings(2차 제목)을 포함. 
- 중복·겹침 없이, 하나의 heading은 하나의 주제만 언급. 
- 제조업·서비스업·플랫폼 등 업종별 특화 섹션(예: '제조 공정 및 공급망 전략', '앱 개발 로드맵')을 필요 시 삽입 
- subheading은 구체적이고 실행 가능한 키워드 중심으로 작성(예: "고객 세분화 및 타깃팅 전략", "지속 가능 공급망 구축") 

###출력형식 
{ 
"title": "…", 
"structure": [ 
{ "heading": "…", "subheadings": ["…", "…", ...] }, 
{ "heading": "…" }, 
{ "heading": "…", "subheadings": ["…"] }, ... 
] 
} 

###businessItem 
{{businessItem}} 
###businessDescription 
{{businessDescription}}`;

// 2단계: 사업계획서 생성 프롬프트
const BUSINESS_PLAN_PROMPT = `###지시사항 
당신은 사업계획서 전문 작성 AI입니다. 사용자가 입력한 title, structure, content, tone 정보를 결합해 가독성·신뢰성·의사결정 지원을 모두 충족하는 사업계획서를 작성하십시오. 

###입력변수 
- title: 사업계획서 전체 제목(입력값 유지) 
- structure: heading·subheadings 배열(입력값 유지) 
- content: heading 또는 subheading별로 대응되는 상세 정보·데이터·주장·예시 
- key는 heading 또는 subheading과 동일, value는 구체 내용 
- tone: 공식적·친근함·설득형 등 

###생성규칙 
1. 본문 구조 유지 & 분리 
- structure에 등록된 heading 순서를 그대로 따릅니다. 
- heading 하위에 subheading이 있으면 sections 배열로 묶고, subheading이 없으면 heading 바로 아래 content를 작성합니다. 
- **재무 계획**(Financial Projections)과 **투자 제안**(Funding Request)이 동일 heading에 혼재 시 → 두 단락으로 분리('계획' → '요청' 순).. 
2. 단락 길이 & 형식 
- 각 content 항목은 두 개 이상의 단락으로 작성하고, 단락은 300 ~ 500자(공백 포함)**로 서술합니다. 
- 단락 구조(아래 3 종류의 문장 결합하여 줄글로 표시): 
(1) 주장·핵심 문장 
(2) 근거·데이터·예시 
(3) 요약·미래 전망 
3. 데이터·수치 활용 
- 제공된 수치가 없으면 "△△ %(TBD)"로 표기해 데이터 공백을 명확히 표시합니다. 
- 증가·감소·높다·낮다 등 모호 표현 대신 정확 값·비율·기간을 기입하십시오. 
- 필요 시 "(예: 전년 동기 대비 +7 %)" 식으로 괄호 내 비교 기준을 명시합니다. 
4. 톤 / 스타일 일관성 
- 구어체·비속어·모호 표현을 배제하고, 사실 기반·객관적 서술을 유지합니다. 
- 1인칭("저희/우리") 지양, 제3자적·객관적 서술 선호합니다. 
5. 인용·참고문헌 
- 본문 중 외부 자료·조사 결과를 언급할 때는 "(OECD, 2023)" 식 괄호 인용을 사용합니다. 
- 보고서 말미에 References heading을 자동 생성하여 APA 7판 형식으로 정렬된 참고문헌 리스트를 나열합니다. 
- 내부 문서일 경우 작성자·부서·연도·문서명(있으면)을 표기하십시오. 

###출력형식 
{ 
"title": "…", 
"report": [ 
{ 
"heading": "…", 
"sections": [ 
{ "subheading": "…", "content": ["…", "...", ...] }, 
{ "subheading": "…", "content": ["…"] } 
] 
}, 
{ 
"heading": "…", 
"content": ["…", "...", ...] // subheading이 없을 때 
}, 
... (모든 heading 작성 후) 
{ 
"heading": "References", 
"content": ["참고문헌 APA 형식 목록 ① …", "② …", ...] 
} 
] 
} 


###titleStructure
{{titleStructure}}
###content
{{content}}
###tone
{{tone}}`;

export async function generateOutline(inputs: OutlineInputs): Promise<OutlineResponse> {
  const prompt = OUTLINE_PROMPT
    .replace('{{businessItem}}', inputs.businessItem)
    .replace('{{businessDescription}}', inputs.businessDescription);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 5000,
  }, {
    timeout: 25000, // 25초 타임아웃 설정
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI API returned empty response');
  }

  console.log('Outline API Response:', content);

  try {
    // JSON 부분만 추출 시도
    let jsonContent = content.trim();
    
    // JSON이 ```json으로 감싸져 있는 경우 처리
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // { } 사이의 내용만 추출
      const braceMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonContent = braceMatch[0];
      }
    }
    
    return JSON.parse(jsonContent) as OutlineResponse;
  } catch (error) {
    console.error('Failed to parse outline response as JSON:', content);
    throw new Error(`Failed to parse OpenAI response as JSON: ${error}`);
  }
}



export async function generateBusinessPlan(inputs: BusinessPlanInputs): Promise<BusinessPlanResponse> {
  const prompt = BUSINESS_PLAN_PROMPT
    .replace('{{titleStructure}}', JSON.stringify(inputs.titleStructure))
    .replace('{{content}}', JSON.stringify(inputs.content))
    .replace('{{tone}}', inputs.tone);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000, // 토큰 수를 대폭 줄여서 응답 시간 단축
  }, {
    timeout: 60000, // 60초 타임아웃 설정
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI API returned empty response');
  }

  console.log('Business Plan API Response:', content);

  try {
    // JSON 부분만 추출 시도
    let jsonContent = content.trim();
    
    // JSON이 ```json으로 감싸져 있는 경우 처리
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // { } 사이의 내용만 추출
      const braceMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonContent = braceMatch[0];
      }
    }
    
    return JSON.parse(jsonContent) as BusinessPlanResponse;
  } catch (error) {
    console.error('Failed to parse business plan response as JSON:', content);
    throw new Error(`Failed to parse OpenAI response as JSON: ${error}`);
  }
} 