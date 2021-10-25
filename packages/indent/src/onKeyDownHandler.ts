import React from 'react';
import { TEditor } from '../../core/dist';
import { indent, outdent } from './transforms';

export const onKeyDownHandler = (editor: TEditor) => (
  event: React.KeyboardEvent
): void => {
  if (
    event.key === 'Tab' &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.shiftKey ? outdent(editor) : indent(editor);
  }
};
