import React, {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { isHotkey } from '@udecode/plate-common';
import { focusEditor, useEditorPlugin } from '@udecode/plate-common/react';

import { type AIActionGroup, AIPlugin } from '../AIPlugin';
import { streamInsertText, streamInsertTextSelection } from '../stream';
import { getContent } from '../utils';

interface UseAIStateProps {
  CursorCommands: () => JSX.Element;
  CursorCommandsActions: any;
  CursorSuggestionActions: any;
  CursorSuggestions: () => JSX.Element;
  SelectionCommands: () => JSX.Element;
  SelectionCommandsActions: any;
  SelectionSuggestionActions: any;
  SelectionSuggestions: () => JSX.Element;
  defaultValues: Record<string, string>;
  menu: any;
}

export const useAIState = ({
  CursorCommands,
  CursorCommandsActions,
  CursorSuggestionActions,
  CursorSuggestions,
  SelectionCommands,
  SelectionCommandsActions,
  SelectionSuggestionActions,
  SelectionSuggestions,
  defaultValues,
  menu,
}: UseAIStateProps) => {
  const { api, editor, setOption, setOptions, useOption } =
    useEditorPlugin(AIPlugin);

  const isOpen = useOption('isOpen', editor.id);
  const action = useOption('action');
  const aiState = useOption('aiState');
  const menuType = useOption('menuType');
  const setAction = (action: AIActionGroup) => setOption('action', action);

  const { aiEditor } = editor.useOptions(AIPlugin);

  useEffect(() => {
    setOptions({
      store: menu,
    });
    // eslint-disable-next`-line react-hooks/exhaustive-deps
  }, [isOpen, menu, setOptions]);

  const [values, setValues] = useState(defaultValues);
  const [searchValue, setSearchValue] = useState('');

  const streamInsert = useCallback(async () => {
    if (!aiEditor) return;
    if (menuType === 'selection') {
      const content = getContent(editor, aiEditor);

      await streamInsertTextSelection(editor, aiEditor, {
        prompt: `user prompt is ${searchValue} the content is ${content}`,
      });
    } else if (menuType === 'space') {
      await streamInsertText(editor, {
        prompt: searchValue,
      });
    }
  }, [aiEditor, editor, menuType, searchValue]);

  return {
    CursorCommands,
    CursorCommandsActions,
    CursorSuggestionActions,
    CursorSuggestions,
    SelectionCommands,
    SelectionCommandsActions,
    SelectionSuggestionActions,
    SelectionSuggestions,
    action,
    aiState,
    api,
    editor,
    menuType,
    searchValue,
    setAction,
    setSearchValue,
    setValues,
    streamInsert,
    values,
  };
};

export const useAI = (props: ReturnType<typeof useAIState>) => {
  const {
    CursorCommands,
    CursorCommandsActions,
    CursorSuggestionActions,
    CursorSuggestions,
    SelectionCommands,
    SelectionCommandsActions,
    SelectionSuggestionActions,
    SelectionSuggestions,
    action,
    aiState,
    api,
    editor,
    menuType,
    searchValue,
    setAction,
    setSearchValue,
    setValues,
    streamInsert,
    values,
  } = props;

  const onInputKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (isHotkey('backspace')(e) && searchValue.length === 0) {
      e.preventDefault();
      api.ai.hide();
      focusEditor(editor);
    }
    if (isHotkey('enter')(e)) await streamInsert();
  };
  const [CurrentItems, CurrentActions] = React.useMemo(() => {
    if (aiState === 'done') {
      if (menuType === 'selection')
        return [SelectionSuggestions, SelectionSuggestionActions];

      return [CursorSuggestions, CursorSuggestionActions];
    }
    if (menuType === 'selection')
      return [SelectionCommands, SelectionCommandsActions];

    return [CursorCommands, CursorCommandsActions];
  }, [aiState, menuType]);

  /** IME */
  const [isComposing, setIsComposing] = useState(false);

  // const searchItems = useMemo(() => {
  //   return isComposing
  //     ? []
  //     : filterAndBuildMenuTree(Object.values(CurrentActions), searchValue);
  // }, [CurrentActions, isComposing, searchValue]);
};
