'use client';
import { CodePlugin, SkipMarkPlugin } from '@udecode/plate-basic-marks/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';

export const skipMarkPlugin = SkipMarkPlugin.configure({
  options: {
    allow: [SuggestionPlugin.key, CodePlugin.key, CommentsPlugin.key],
  },
});
