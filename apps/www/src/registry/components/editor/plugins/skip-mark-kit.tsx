'use client';

import { CodePlugin } from '@udecode/plate-basic-marks/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { SkipMarkPlugin } from '@udecode/plate/react';

export const SkipMarkKit = [
  SkipMarkPlugin.configure({
    options: {
      query: {
        allow: [SuggestionPlugin.key, CodePlugin.key, CommentsPlugin.key],
      },
    },
  }),
];
