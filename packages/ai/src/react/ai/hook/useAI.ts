import React, {
  type KeyboardEvent,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isHotkey } from '@udecode/plate-common';
import { focusEditor, useEditorPlugin } from '@udecode/plate-common/react';
import {
  type Action,
  Ariakit,
  filterAndBuildMenuTree,
} from '@udecode/plate-menu';

import type { AIActions, AICommands } from '../types';

import { type AIActionGroup, AIPlugin } from '../AIPlugin';
import { streamInsertText, streamInsertTextSelection } from '../stream';
import { getContent } from '../utils';

interface UseAIStateProps {
  aiActions: AIActions;
  aiCommands: AICommands;

  defaultValues: Record<string, string>;
}

export type AICommandsAction = Record<string, Action>;

export const useAI = ({
  aiActions,
  aiCommands,
  defaultValues,
}: UseAIStateProps) => {
  const {
    CursorCommandsActions,
    CursorSuggestionActions,
    SelectionCommandsActions,
    SelectionSuggestionActions,
  } = aiActions;

  const {
    CursorCommands,
    CursorSuggestions,
    SelectionCommands,
    SelectionSuggestions,
  } = aiCommands;

  const { api, editor, setOption, setOptions, useOption } =
    useEditorPlugin(AIPlugin);

  const isOpen = useOption('isOpen', editor.id);
  const action = useOption('action');
  const aiState = useOption('aiState');
  const menuType = useOption('menuType');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setAction = (action: AIActionGroup) => setOption('action', action);

  const { aiEditor } = editor.useOptions(AIPlugin);

  const menu = Ariakit.useMenuStore();
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
    } else if (menuType === 'cursor') {
      await streamInsertText(editor, {
        prompt: searchValue,
      });
    }
  }, [aiEditor, editor, menuType, searchValue]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onInputKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (isHotkey('backspace')(e) && searchValue.length === 0) {
      e.preventDefault();
      api.ai.hide();
      focusEditor(editor);
    }
    if (isHotkey('enter')(e)) await streamInsert();
  };

  const onCloseMenu = useCallback(() => {
    //  close menu if ai is not generating
    if (aiState === 'idle' || aiState === 'done') {
      api.ai.hide();
      focusEditor(editor);
    }
    // abort if ai is generating
    if (aiState === 'generating' || aiState === 'requesting') {
      api.ai.abort();
    }
  }, [aiState, api.ai, editor]);

  // close on escape
  useEffect(() => {
    const keydown = (e: any) => {
      if (!isOpen || !isHotkey('escape')(e)) return;

      onCloseMenu();
    };

    document.addEventListener('keydown', keydown);

    return () => {
      document.removeEventListener('keydown', keydown);
    };
  }, [aiState, api.ai, editor, isOpen, onCloseMenu]);

  const [CurrentItems, CurrentActions] = React.useMemo(() => {
    if (aiState === 'done') {
      if (menuType === 'selection')
        return [SelectionSuggestions, SelectionSuggestionActions];

      return [CursorSuggestions, CursorSuggestionActions];
    }
    if (menuType === 'selection')
      return [SelectionCommands, SelectionCommandsActions];

    return [CursorCommands, CursorCommandsActions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState, menuType]);

  /** IME */
  const [isComposing, setIsComposing] = useState(false);

  const searchItems = useMemo(() => {
    return isComposing
      ? []
      : filterAndBuildMenuTree(Object.values(CurrentActions), searchValue);
  }, [CurrentActions, isComposing, searchValue]);

  /** Props */

  const menuProps = useMemo(() => {
    return {
      flip: false,
      loading: aiState === 'generating' || aiState === 'requesting',
      open: isOpen,
      setAction: setAction,
      store: menu,
      values: values,
      onClickOutside: () => {
        return editor.getApi(AIPlugin).ai.hide();
      },
      onValueChange: (value: string) =>
        startTransition(() => setSearchValue(value)),
      onValuesChange: (values: typeof defaultValues) => {
        setValues(values);
      },
    };
  }, [aiState, editor, isOpen, menu, setAction, values]);

  const comboboxProps = useMemo(() => {
    return {
      id: '__potion_ai_menu_searchRef',
      value: searchValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setSearchValue(e.target.value),
      onCompositionEnd: () => setIsComposing(false),
      onCompositionStart: () => setIsComposing(true),
      onKeyDown: onInputKeyDown,
    };
  }, [onInputKeyDown, searchValue]);

  const submitButtonProps = useMemo(() => {
    return {
      disabled: searchValue.trim().length === 0,
      onClick: async () => {
        await streamInsert();
      },
    };
  }, [searchValue, streamInsert]);

  return {
    CurrentItems,
    action,
    aiEditor,
    aiState,
    comboboxProps,
    menuProps,
    menuType,
    searchItems,
    submitButtonProps,
    onCloseMenu,
  };
};
