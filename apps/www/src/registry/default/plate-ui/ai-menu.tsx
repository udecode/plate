/* eslint-disable tailwindcss/no-custom-classname */
'use client';

import React, {
  type KeyboardEvent,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cn } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin } from '@udecode/plate-core/react';
import { focusEditor } from '@udecode/slate-react';
import isHotkey from 'is-hotkey';

import { Icons } from '@/components/icons';
import { Button } from '@/registry/default/plate-ui/button';

import { useActionHandler } from './action-handler';
import {
  DefaultActions,
  DefaultSuggestionActions,
  SelectionActions,
  SelectionSuggestionActions,
  defaultValues,
} from './ai-actions';
import {
  DefaultItems,
  DefaultSuggestionItems,
  SelectionItems,
  SelectionSuggestionItems,
} from './ai-menu-items';
import { AIPreviewEditor } from './ai-previdew-editor';
import {
  type actionGroup,
  Ariakit,
  Menu,
  comboboxVariants,
  filterAndBuildMenuTree,
  renderSearchMenuItems,
} from './menu';
import { streamInsertText, streamInsertTextSelection } from './stream';
import { getContent } from './utils';

// eslint-disable-next-line react/display-name
export const AIMenu = memo(({ children }: React.PropsWithChildren) => {
  const { api, editor, setOption, setOptions, useOption } =
    useEditorPlugin(AIPlugin);

  const isOpen = useOption('isOpen', editor.id);
  const action = useOption('action');
  const aiState = useOption('aiState');
  const menuType = useOption('menuType');
  const setAction = (action: actionGroup) => setOption('action', action);

  const { aiEditor } = editor.useOptions(AIPlugin);

  const isModalOpenRef = React.useRef(false);
  // init
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
    } else if (menuType === 'space') {
      await streamInsertText(editor, {
        prompt: searchValue,
      });
    }
  }, [aiEditor, editor, menuType, searchValue]);

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

  // block editor while generating
  // const setReadOnly = usePlateStore().set.readOnly();
  useEffect(() => {
    if (aiState === 'generating') {
      // setReadOnly(true);
    }
    if (aiState === 'done') {
      // setReadOnly(false);
      setSearchValue('');
    }
  }, [aiState, setSearchValue]);

  useActionHandler(action, aiEditor!);

  const [CurrentItems, CurrentActions] = React.useMemo(() => {
    if (aiState === 'done') {
      if (menuType === 'selection')
        return [SelectionSuggestionItems, SelectionSuggestionActions];

      return [DefaultSuggestionItems, DefaultSuggestionActions];
    }
    if (menuType === 'selection') return [SelectionItems, SelectionActions];

    return [DefaultItems, DefaultActions];
  }, [aiState, menuType]);

  /** IME */
  const [isComposing, setIsComposing] = useState(false);

  const searchItems = useMemo(() => {
    return isComposing
      ? []
      : filterAndBuildMenuTree(Object.values(CurrentActions), searchValue);
  }, [CurrentActions, isComposing, searchValue]);

  return (
    <>
      <Menu
        variant="ai"
        loading={aiState === 'generating' || aiState === 'requesting'}
        open={isOpen}
        onClickOutside={(e) => {
          if (aiState === 'idle') return editor.getApi(AIPlugin).ai.hide();
          if (isModalOpenRef.current) return;

          e.preventDefault();
          isModalOpenRef.current = true;

          // pushModal('Discard', {
          //   onCancel: () => {
          //     setTimeout(() => {
          //       editor.getApi(AIPlugin).ai.focusMenu();
          //     }, 0);
          //   },
          //   onConfirm: () => {
          //     // TODO: cancel stream
          //     editor.getApi(AIPlugin).ai.hide();
          //   },
          //   onSettled: () => {
          //     isModalOpenRef.current = false;
          //   },
          // });
        }}
        onValueChange={(value) => startTransition(() => setSearchValue(value))}
        onValuesChange={(values: typeof defaultValues) => {
          setValues(values);
        }}
        combobox={
          <input
            id="__potion_ai_menu_searchRef"
            className="flex-1 px-1"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onCompositionEnd={() => setIsComposing(false)}
            onCompositionStart={() => setIsComposing(true)}
            onKeyDown={onInputKeyDown}
            placeholder={
              aiState === 'done'
                ? 'Tell AI what todo next'
                : 'Ask AI to write something'
            }
          />
        }
        comboboxClassName={cn(
          menuType === 'selection' &&
            aiState !== 'idle' &&
            'rounded-t-none border-t-0 '
        )}
        comboboxListClassName={cn(
          searchItems && searchItems.length === 0 && 'border-0'
        )}
        comboboxSubmitButton={
          <Button
            size="icon"
            variant="ghost"
            className="ml-2"
            disabled={searchValue.trim().length === 0}
            onClick={async () => {
              await streamInsert();
            }}
          >
            <Icons.submit></Icons.submit>
          </Button>
        }
        flip={false}
        injectAboveMenu={useMemo(() => {
          if (menuType === 'selection' && aiState !== 'idle')
            return <AIPreviewEditor />;
        }, [aiState, menuType])}
        loadingPlaceholder={
          <div
            className={cn(
              'flex justify-between',
              comboboxVariants({ variant: 'ai' }),
              menuType === 'selection' &&
                aiState !== 'idle' &&
                'rounded-t-none border-t-0'
            )}
          >
            <div>
              <span>AI is Writing</span>
              <div className="loader ml-1 mt-px inline-block" />
            </div>

            <Icons.stop
              className="size-5 cursor-pointer"
              onClick={() => onCloseMenu()}
            ></Icons.stop>
          </div>
        }
        setAction={setAction}
        store={menu}
        values={values}
      >
        {renderSearchMenuItems(searchItems, { hiddenOnEmpty: true }) ?? (
          <CurrentItems />
        )}
      </Menu>
      {children}
    </>
  );
});
