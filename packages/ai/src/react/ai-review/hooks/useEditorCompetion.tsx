import { useCompletion, UseCompletionOptions } from '@ai-sdk/react';
import React from 'react';
import { AIReviewPlugin } from '../AIReviewPlugin';
import { useEditorPlugin } from 'platejs/react';

export const useEditorCompletion = (options: UseCompletionOptions = {}) => {
  const { setOption } = useEditorPlugin(AIReviewPlugin);

  const completion = useCompletion({
    api: '/api/ai/review',
    ...options,
  });

  React.useEffect(() => {
    setOption('completion', completion);
  }, [completion]);

  return completion;
};
