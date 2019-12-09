import React, { useEffect, useMemo, useRef, useState } from 'react';
import { css } from 'emotion';
import { createEditor, Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from 'slate-react';
import { Button, Icon, Menu, Portal } from '../../components';
import { initialValue } from './config';

const isFormatActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: { [format]: true },
    mode: 'all',
  });
  return !!match;
};

const withFormatting = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    switch (command.type) {
      case 'toggle_format': {
        const { format } = command;
        const isActive = isFormatActive(editor, format);
        Editor.setNodes(
          editor,
          { [format]: isActive ? null : true },
          { match: 'text', split: true }
        );
        break;
      }

      default: {
        exec(command);
        break;
      }
    }
  };

  return editor;
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underlined) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const HoveringToolbar = () => {
  const ref = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el: any = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.text(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection && domSelection.getRangeAt(0);
    const rect = domRange && domRange.getBoundingClientRect();

    el.style.opacity = 1;
    if (rect) {
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
      el.style.left = `${rect.left +
        window.pageXOffset -
        el.offsetWidth / 2 +
        rect.width / 2}px`;
    }
  });

  return (
    <Portal>
      <Menu
        ref={ref}
        className={css`
          padding: 8px 7px 6px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #222;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
      >
        <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" />
        <FormatButton format="underlined" icon="format_underlined" />
      </Menu>
    </Portal>
  );
};

const FormatButton = ({ format, icon }: any) => {
  const editor = useSlate();
  return (
    <Button
      reversed
      active={isFormatActive(editor, format)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        editor.exec({ type: 'toggle_format', format });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export const HoveringMenu = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const editor = useMemo(
    () => withFormatting(withHistory(withReact(createEditor()))),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <HoveringToolbar />
      <Editable
        renderLeaf={props => <Leaf {...props} />}
        placeholder="Enter some text..."
        onDOMBeforeInput={(event: any) => {
          switch (event.inputType) {
            case 'formatBold':
              return editor.exec({ type: 'toggle_format', format: 'bold' });
            case 'formatItalic':
              return editor.exec({ type: 'toggle_format', format: 'italic' });
            case 'formatUnderline':
              return editor.exec({
                type: 'toggle_format',
                format: 'underlined',
              });
            default:
              break;
          }
        }}
      />
    </Slate>
  );
};
