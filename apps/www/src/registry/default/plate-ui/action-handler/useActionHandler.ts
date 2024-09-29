'use client';
import { useEffect } from 'react';

import type { actionGroup } from '@/registry/default/plate-ui/menu';

import { type PlateEditor, useEditorRef } from '@udecode/plate-core/react';

import { defaultActionHandler } from './defaultActionHandler';
import { defaultSuggestionActionHandler } from './defaultSuggestionActionHandler';
import { selectionActionHandler } from './selectionActionHandler';
import { selectionSuggestionActionHandler } from './selectionSuggestionActionHandler';

export const useActionHandler = (
  action: actionGroup | null,
  aiEditor: PlateEditor
) => {
  const editor = useEditorRef();

  useEffect(() => {
    if (!action) return;

    const { group, value } = action;

    if (!value) return;

    void defaultActionHandler(editor, { group, value });

    void defaultSuggestionActionHandler(editor, { group, value });

    void selectionActionHandler(editor, aiEditor, { group, value });

    void selectionSuggestionActionHandler(editor, aiEditor, {
      group,
      value,
    });
  }, [action, aiEditor, editor]);
};

export interface ActionHandlerOptions {
  value: string;
  group?: string;
}
