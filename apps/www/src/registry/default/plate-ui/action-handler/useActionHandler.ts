'use client';
import { useEffect } from 'react';

import type { actionGroup } from '@/registry/default/plate-ui/menu';

import { type PlateEditor, useEditorRef } from '@udecode/plate-core/react';

import { cursorCommandsHandler } from './cursorCommandsHandler';
import { cursorSuggestionsHandler } from './cursorSuggestionsHandler';
import { selectionCommandsHandler } from './selectionCommandsHandler';
import { selectionSuggestionsHandler } from './selectionSuggestionsHandler';

export const useActionHandler = (
  action: actionGroup | null,
  aiEditor: PlateEditor
) => {
  const editor = useEditorRef();

  useEffect(() => {
    if (!action) return;

    const { group, value } = action;

    if (!value) return;

    void cursorCommandsHandler(editor, { group, value });

    void cursorSuggestionsHandler(editor, { group, value });

    void selectionCommandsHandler(editor, aiEditor, { group, value });

    void selectionSuggestionsHandler(editor, aiEditor, {
      group,
      value,
    });
  }, [action, aiEditor, editor]);
};

export interface ActionHandlerOptions {
  value: string;
  group?: string;
}
