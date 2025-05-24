import { DatePlugin } from '@udecode/plate-date/react';
import { UnselectablePlugin } from '@udecode/plate-select';

export const unselectablePlugin = UnselectablePlugin.configure({
  options: {
    query: {
      allow: [DatePlugin.key],
    },
  },
});
