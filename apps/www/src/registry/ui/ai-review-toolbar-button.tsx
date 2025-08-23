'use client';

import * as React from 'react';

import { AIChatPlugin, AIReviewPlugin } from '@platejs/ai/react';
import { useEditorPlugin } from 'platejs/react';

import { ToolbarButton } from './toolbar';
import { useCompletion } from '@ai-sdk/react';

export function AIReviewToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { editor, api } = useEditorPlugin(AIReviewPlugin);

  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/ai/review',
  });

  // console.log(completion);
  return (
    <>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          id="input"
        />
        <button onClick={handleSubmit} type="submit">xxxSubmit</button>
        <div>{completion}</div>
    </>

    // <ToolbarButton
    //   {...props}
    //   onClick={() => {
    //     api.aiReview.generateComment();
    //     handleSubmit();
    //   }}
    //   onMouseDown={(e) => {
    //     e.preventDefault();
    //   }}
    // />
  );
}
