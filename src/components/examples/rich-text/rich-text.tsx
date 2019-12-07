import React, { useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { RenderElementProps, RenderMarkProps, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { Toolbar } from '../../components';
import { BlockButton } from './BlockButton';
import { initialValue, MARK_HOTKEYS } from './config';
import { MarkButton } from './MarkButton';
import { editorPlugins } from './plugins';

export const isMarkActive = (editor: Editor, type: string) => {
  const [mark] = Editor.marks(editor, { match: { type }, mode: 'universal' });
  return !!mark;
};

export const isBlockActive = (editor: Editor, type: string) => {
  const [match] = Editor.nodes(editor, { match: { type } });
  return !!match;
};

export const RichText = () => {
  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Toolbar>
        <MarkButton type="bold" icon="format_bold" />
        <MarkButton type="italic" icon="format_italic" />
        <MarkButton type="underlined" icon="format_underlined" />
        <MarkButton type="code" icon="code" />
        <BlockButton type="heading-one" icon="looks_one" />
        <BlockButton type="heading-two" icon="looks_two" />
        <BlockButton type="block-quote" icon="format_quote" />
        <BlockButton type="numbered-list" icon="format_list_numbered" />
        <BlockButton type="bulleted-list" icon="format_list_bulleted" />
      </Toolbar>
      <Editable
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        key={1}
        onKeyDown={event => {
          for (const hotkey of Object.keys(MARK_HOTKEYS)) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              editor.exec({
                type: 'toggle_mark',
                mark: MARK_HOTKEYS[hotkey],
              });
            }
          }
        }}
      />
    </Slate>
  );
};
