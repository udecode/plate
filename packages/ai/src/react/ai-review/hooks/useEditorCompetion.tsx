import React from 'react';

import { type UseCompletionOptions, useCompletion } from '@ai-sdk/react';
import { useEditorPlugin } from 'platejs/react';

import { AIReviewPlugin } from '../AIReviewPlugin';

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
