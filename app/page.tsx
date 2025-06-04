'use client';

import { useState } from 'react';
import { OutlineInputs, OutlineResponse, BusinessPlanResponse } from '../types';

export default function Home() {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<OutlineInputs>({
    businessItem: '',
    businessDescription: '',
    tone: 'professional'
  });
  
  // 파일 업로드 관련 상태
  const [file, setFile] = useState<File | null>(null);
  const [isFileInput, setIsFileInput] = useState(false);
  const [uploadedContent, setUploadedContent] = useState<string>('');
  
  // 로딩 상태
  const [isOutlineLoading, setIsOutlineLoading] = useState(false);
  const [isBusinessPlanLoading, setIsBusinessPlanLoading] = useState(false);
  
  // 오류 상태
  const [error, setError] = useState<string>('');
  
  // 결과 상태
  const [outline, setOutline] = useState<OutlineResponse | null>(null);
  const [editedOutline, setEditedOutline] = useState<OutlineResponse | null>(null);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanResponse | null>(null);
  
  // 활성 탭
  const [activeTab, setActiveTab] = useState<'outline' | 'businessplan'>('outline');

  // 폼 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 파일 업로드 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          setUploadedContent(result.data.content);
          setError('');
        } else {
          setError(result.error || '파일 업로드에 실패했습니다.');
          setFile(null);
          setUploadedContent('');
        }
      } catch (error) {
        setError('파일 업로드 중 네트워크 오류가 발생했습니다.');
        setFile(null);
        setUploadedContent('');
      }
    } else {
      setFile(null);
      setUploadedContent('');
    }
  };

  // 입력 타입 변경
  const handleInputTypeChange = (useFile: boolean) => {
    setIsFileInput(useFile);
    setError('');
    if (!useFile) {
      setFile(null);
      setUploadedContent('');
    }
  };

  // 목차 생성
  const handleOutlineGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOutlineLoading(true);
    setError('');

    try {
      let descriptionData = formData.businessDescription;
      
      if (isFileInput && uploadedContent) {
        descriptionData = uploadedContent;
      }

      if (!formData.businessItem.trim()) {
        setError('사업 아이템을 입력해주세요.');
        setIsOutlineLoading(false);
        return;
      }

      if (!descriptionData.trim()) {
        setError(isFileInput ? '파일을 업로드해주세요.' : '사업 아이템 설명을 입력해주세요.');
        setIsOutlineLoading(false);
        return;
      }

      const response = await fetch('/api/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessItem: formData.businessItem,
          businessDescription: descriptionData,
          tone: formData.tone
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutline(result.data);
        setEditedOutline(result.data);
        setActiveTab('outline');
        setBusinessPlan(null); // 새 목차 생성 시 기존 사업계획서 초기화
      } else {
        setError(result.error || '목차 생성에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsOutlineLoading(false);
    }
  };

  // 사업계획서 생성
  const handleBusinessPlanGenerate = async () => {
    if (!editedOutline) return;
    
    setIsBusinessPlanLoading(true);
    setError('');

    try {
      const response = await fetch('/api/business-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titleStructure: editedOutline,
          content: {},
          tone: formData.tone
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBusinessPlan(result.data);
        setActiveTab('businessplan');
        // 성공 알림 (선택적)
        setTimeout(() => {
          alert('사업계획서가 성공적으로 생성되었습니다! 사업계획서 탭에서 확인하세요.');
        }, 500);
      } else {
        setError(`사업계획서 생성에 실패했습니다: ${result.error}`);
      }
    } catch (error) {
      setError('사업계획서 생성 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsBusinessPlanLoading(false);
    }
  };

  // 목차 편집 함수들
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedOutline) return;
    setEditedOutline(prev => prev ? ({
      ...prev,
      title: e.target.value
    }) : null);
  };

  const handleHeadingChange = (index: number, newHeading: string) => {
    if (!editedOutline) return;
    setEditedOutline(prev => prev ? ({
      ...prev,
      structure: prev.structure.map((item, i) => 
        i === index ? { ...item, heading: newHeading } : item
      )
    }) : null);
  };

  const handleSubheadingChange = (structureIndex: number, subheadingIndex: number, newSubheading: string) => {
    if (!editedOutline) return;
    setEditedOutline(prev => prev ? ({
      ...prev,
      structure: prev.structure.map((item, i) => {
        if (i === structureIndex && item.subheadings) {
          return {
            ...item,
            subheadings: item.subheadings.map((sub, j) => 
              j === subheadingIndex ? newSubheading : sub
            )
          };
        }
        return item;
      })
    }) : null);
  };

  const addSubheading = (structureIndex: number) => {
    if (!editedOutline) return;
    setEditedOutline(prev => prev ? ({
      ...prev,
      structure: prev.structure.map((item, i) => {
        if (i === structureIndex) {
          return {
            ...item,
            subheadings: [...(item.subheadings || []), '새 소제목']
          };
        }
        return item;
      })
    }) : null);
  };

  const removeSubheading = (structureIndex: number, subheadingIndex: number) => {
    if (!editedOutline) return;
    setEditedOutline(prev => prev ? ({
      ...prev,
      structure: prev.structure.map((item, i) => {
        if (i === structureIndex && item.subheadings) {
          return {
            ...item,
            subheadings: item.subheadings.filter((_, j) => j !== subheadingIndex)
          };
        }
        return item;
      })
    }) : null);
  };

  // 새로 시작
  const handleStartOver = () => {
    setFormData({
      businessItem: '',
      businessDescription: '',
      tone: 'professional'
    });
    setFile(null);
    setIsFileInput(false);
    setUploadedContent('');
    setError('');
    setOutline(null);
    setEditedOutline(null);
    setBusinessPlan(null);
    setActiveTab('outline');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-3 gap-6 h-screen">
        {/* 좌측: 입력 영역 (1/3) */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">사업계획서 정보 입력</h2>
            <button
              type="button"
              onClick={handleStartOver}
              disabled={isOutlineLoading || isBusinessPlanLoading}
              className="bg-gray-600 text-white py-1 px-3 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-sm"
            >
              새로 시작
            </button>
          </div>
          
          <form onSubmit={handleOutlineGenerate} className="space-y-6">
            {/* 사업 아이템 */}
            <div>
              <label htmlFor="businessItem" className="block text-sm font-medium text-gray-700 mb-2">
                사업 아이템 *
              </label>
              <textarea
                id="businessItem"
                name="businessItem"
                value={formData.businessItem}
                onChange={handleInputChange}
                placeholder="아이템을 요약해 주세요. (ex. 반려동물 전용 정기배송 서비스)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isOutlineLoading || isBusinessPlanLoading}
                required
              />
            </div>

            {/* 사업 아이템 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업 아이템 설명 *
              </label>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      checked={!isFileInput}
                      onChange={() => handleInputTypeChange(false)}
                      disabled={isOutlineLoading || isBusinessPlanLoading}
                      className="mr-2"
                    />
                    직접 입력
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      checked={isFileInput}
                      onChange={() => handleInputTypeChange(true)}
                      disabled={isOutlineLoading || isBusinessPlanLoading}
                      className="mr-2"
                    />
                    파일 업로드
                  </label>
                </div>
              </div>

              {!isFileInput ? (
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  placeholder="아이디어 노트, 기획안 등 사업계획서 작성을 위한 추가 정보를 입력해주세요."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isOutlineLoading || isBusinessPlanLoading}
                  required
                />
              ) : (
                <div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.docx"
                    disabled={isOutlineLoading || isBusinessPlanLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <div className="text-sm text-gray-500">
                    텍스트 파일(.txt) 또는 Word 문서(.docx)를 업로드할 수 있습니다. 최대 5MB까지 지원됩니다.
                  </div>
                  {file && uploadedContent && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="text-sm text-green-700 mb-2">
                        ✅ 파일 업로드 완료: {file.name}
                      </div>
                      <div className="text-xs text-gray-600 max-h-20 overflow-auto">
                        {uploadedContent.substring(0, 200)}...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 톤/스타일 */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                톤/스타일 *
              </label>
              <select
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                disabled={isOutlineLoading || isBusinessPlanLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="formal">격식체</option>
                <option value="friendly">친근한</option>
                <option value="professional">전문적</option>
              </select>
            </div>

            {/* 목차 생성 및 사업계획서 생성 버튼들을 좌우로 배치 */}
            <div className="flex space-x-4">
              {/* 목차 생성 버튼 */}
              <button
                type="submit"
                disabled={isOutlineLoading || isBusinessPlanLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {isOutlineLoading ? '목차 생성 중...' : '목차 생성'}
              </button>

              {/* 사업계획서 생성 버튼 */}
              <button
                type="button"
                onClick={handleBusinessPlanGenerate}
                disabled={!editedOutline || isOutlineLoading || isBusinessPlanLoading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {isBusinessPlanLoading ? '사업계획서 생성 중...' : '사업계획서 생성'}
              </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* 우측: 결과 영역 (2/3) */}
        <div className="col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          {/* 탭 헤더 */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('outline')}
                className={`tab-button ${activeTab === 'outline' ? 'active' : ''}`}
              >
                목차 {editedOutline && <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">완료</span>}
              </button>
              <button
                onClick={() => setActiveTab('businessplan')}
                className={`tab-button ${activeTab === 'businessplan' ? 'active' : ''}`}
              >
                사업계획서 {businessPlan && <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">완료</span>}
                {isBusinessPlanLoading && <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">생성중</span>}
              </button>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="p-6 h-full overflow-y-auto">
            {activeTab === 'outline' && (
              <div className="tab-content">
                {editedOutline ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">목차 편집</h3>
                      {isBusinessPlanLoading && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          사업계획서 생성 중... (편집 불가)
                        </div>
                      )}
                    </div>
                    
                    {/* 제목 편집 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사업계획서 제목
                      </label>
                      <input
                        type="text"
                        value={editedOutline.title}
                        onChange={handleTitleChange}
                        disabled={isBusinessPlanLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* 목차 구조 편집 */}
                    <div className="space-y-4">
                      {editedOutline.structure.map((item, structureIndex) => (
                        <div key={structureIndex} className="border border-gray-200 rounded-lg p-4">
                          {/* 대제목 */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {structureIndex + 1}. 대제목
                            </label>
                            <input
                              type="text"
                              value={item.heading}
                              onChange={(e) => handleHeadingChange(structureIndex, e.target.value)}
                              disabled={isBusinessPlanLoading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* 소제목들 */}
                          {item.subheadings && item.subheadings.length > 0 && (
                            <div className="ml-4">
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                소제목들
                              </label>
                              <div className="space-y-2">
                                {item.subheadings.map((subheading, subIndex) => (
                                  <div key={subIndex} className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 w-8">
                                      {structureIndex + 1}-{subIndex + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={subheading}
                                      onChange={(e) => handleSubheadingChange(structureIndex, subIndex, e.target.value)}
                                      disabled={isBusinessPlanLoading}
                                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                      onClick={() => removeSubheading(structureIndex, subIndex)}
                                      disabled={isBusinessPlanLoading}
                                      className="text-red-500 hover:text-red-700 px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="소제목 삭제"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 소제목 추가 버튼 */}
                          <button
                            onClick={() => addSubheading(structureIndex)}
                            disabled={isBusinessPlanLoading}
                            className="mt-2 ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            + 소제목 추가
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 최종 목차 미리보기 */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800">최종 목차 미리보기</h4>
                      <div className="space-y-2">
                        <h5 className="text-xl font-bold text-center mb-4">{editedOutline.title}</h5>
                        {editedOutline.structure.map((item, index) => (
                          <div key={index} className="mb-3">
                            <div className="font-semibold text-gray-800">
                              {index + 1}. {item.heading}
                            </div>
                            {item.subheadings && item.subheadings.map((sub, subIndex) => (
                              <div key={subIndex} className="ml-6 text-gray-600">
                                {index + 1}-{subIndex + 1}. {sub}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-20">
                    <p className="text-lg">목차를 생성하려면 좌측에서 정보를 입력하고 "목차 생성" 버튼을 클릭하세요.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'businessplan' && (
              <div className="tab-content">
                {businessPlan ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">완성된 사업계획서</h3>
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            const reportText = businessPlan.report.map(item => {
                              let text = `${item.heading}\n\n`;
                              if (item.sections) {
                                item.sections.forEach(section => {
                                  text += `${section.subheading}\n`;
                                  text += section.content.join('\n') + '\n\n';
                                });
                              } else if (item.content) {
                                text += item.content.join('\n') + '\n\n';
                              }
                              return text;
                            }).join('\n');
                            
                            const element = document.createElement('a');
                            const file = new Blob([reportText], { type: 'text/plain' });
                            element.href = URL.createObjectURL(file);
                            element.download = `${businessPlan.title}.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                        >
                          다운로드
                        </button>
                        <button
                          onClick={() => {
                            const reportText = businessPlan.report.map(item => {
                              let text = `${item.heading}\n\n`;
                              if (item.sections) {
                                item.sections.forEach(section => {
                                  text += `${section.subheading}\n`;
                                  text += section.content.join('\n') + '\n\n';
                                });
                              } else if (item.content) {
                                text += item.content.join('\n') + '\n\n';
                              }
                              return text;
                            }).join('\n');
                            navigator.clipboard.writeText(reportText);
                            alert('사업계획서가 클립보드에 복사되었습니다!');
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                        >
                          복사
                        </button>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <div className="text-gray-800 leading-relaxed space-y-6">
                        {businessPlan.report.map((item, index) => (
                          <div key={index}>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{item.heading}</h3>
                            {item.sections ? (
                              item.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-4">
                                  <h4 className="text-md font-semibold text-gray-800 mb-2">{section.subheading}</h4>
                                  <div className="text-gray-700">
                                    {section.content.map((paragraph, pIndex) => (
                                      <p key={pIndex} className="mb-2">{paragraph}</p>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : item.content ? (
                              <div className="text-gray-700">
                                {item.content.map((paragraph, pIndex) => (
                                  <p key={pIndex} className="mb-2">{paragraph}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-20">
                    <p className="text-lg">
                      {editedOutline 
                        ? '목차를 확인한 후 좌측에서 "사업계획서 생성" 버튼을 클릭하세요.'
                        : '먼저 목차를 생성해주세요.'
                      }
                    </p>
                    {isBusinessPlanLoading && (
                      <div className="mt-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm">사업계획서를 생성하고 있습니다...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 