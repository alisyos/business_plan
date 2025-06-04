'use client';

import { useState, useEffect } from 'react';
import type { PromptsCollection, PromptData } from '../../types';

interface AdminPageState {
  isLoading: boolean;
  prompts: PromptsCollection | null;
  editingPrompt: PromptData | null;
  editContent: string;
  error: string;
  successMessage: string;
}

export default function AdminPage() {
  const [state, setState] = useState<AdminPageState>({
    isLoading: false,
    prompts: null,
    editingPrompt: null,
    editContent: '',
    error: '',
    successMessage: ''
  });

  // 컴포넌트 마운트 시 프롬프트 로딩
  useEffect(() => {
    loadPrompts();
  }, []);

  // 프롬프트 로딩
  const loadPrompts = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = await fetch('/api/admin/prompts');
      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, prompts: result.data }));
      } else {
        setState(prev => ({ ...prev, error: result.error || '프롬프트 로딩에 실패했습니다.' }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: '프롬프트 로딩 중 오류가 발생했습니다.' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 프롬프트 편집 시작
  const startEditing = (prompt: PromptData) => {
    setState(prev => ({
      ...prev,
      editingPrompt: prompt,
      editContent: prompt.content,
      error: '',
      successMessage: ''
    }));
  };

  // 프롬프트 저장
  const savePrompt = async () => {
    if (!state.editingPrompt) return;

    setState(prev => ({ ...prev, isLoading: true, error: '', successMessage: '' }));

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: state.editingPrompt.id,
          content: state.editContent
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          successMessage: '프롬프트가 성공적으로 저장되었습니다.',
          editingPrompt: null,
          editContent: ''
        }));
        loadPrompts();
      } else {
        setState(prev => ({ ...prev, error: result.error || '프롬프트 저장에 실패했습니다.' }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: '프롬프트 저장 중 오류가 발생했습니다.' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 편집 취소
  const cancelEditing = () => {
    setState(prev => ({
      ...prev,
      editingPrompt: null,
      editContent: '',
      error: '',
      successMessage: ''
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="space-y-6">

        {state.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {state.error}
          </div>
        )}

        {state.successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {state.successMessage}
          </div>
        )}

        {state.isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        )}

        {state.prompts && (
          <>
            {Object.entries(state.prompts).map(([key, prompt]) => (
              <div key={key} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{prompt.name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{prompt.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      마지막 수정: {new Date(prompt.updatedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  
                  {state.editingPrompt?.id === prompt.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={savePrompt}
                        disabled={state.isLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(prompt)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      편집
                    </button>
                  )}
                </div>

                {state.editingPrompt?.id === prompt.id ? (
                  <textarea
                    value={state.editContent}
                    onChange={(e) => setState(prev => ({ ...prev, editContent: e.target.value }))}
                    className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="프롬프트 내용을 입력하세요..."
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono max-h-64 overflow-y-auto">
                      {prompt.content}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
} 