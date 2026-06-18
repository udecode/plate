import { type MouseEvent, type PointerEvent, useEffect, useRef } from 'react';
import { RangeApi } from '@platejs/slate';
import {
  Editable,
  type RenderLeafProps,
  Slate,
  useEditor,
  useEditorFocused,
  useEditorSelection,
  useEditorSelector,
  useSlateEditor,
} from '@platejs/slate-react';

import { Button, Icon, Menu, Portal } from './components';
import type {
  CustomEditor,
  CustomTextKey,
  CustomValue,
} from './custom-types.d';
import { isMarkActive, toggleMark } from './mark-utils';

const HoveringMenuExample = () => {
  const initialValue: CustomValue = [
    {
      type: 'paragraph',
      children: [
        {
          text: 'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
        },
        { text: 'bold', bold: true },
        { text: ', ' },
        { text: 'italic', italic: true },
        { text: ', or anything else you might want to do!' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: 'Try it out yourself! Just ' },
        {
          text: 'select any piece of text and the menu will appear',
          bold: true,
        },
        { text: '.' },
      ],
    },
  ];
  const editor = useSlateEditor({
    initialValue,
  });

  return (
    <Slate editor={editor}>
      <HoveringToolbar />
      <Editable
        onDOMBeforeInput={(event) => {
          switch (event.inputType) {
            case 'formatBold':
              toggleMark(editor, 'bold');
              return true;
            case 'formatItalic':
              toggleMark(editor, 'italic');
              return true;
            case 'formatUnderline':
              toggleMark(editor, 'underline');
              return true;
          }
        }}
        placeholder="Enter some text..."
        renderLeaf={Leaf}
      />
    </Slate>
  );
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useEditor<CustomEditor>();
  const inFocus = useEditorFocused();
  const selection = useEditorSelection();

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !inFocus ||
      RangeApi.isCollapsed(selection) ||
      editor.read((state) => state.text.string(selection)) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      el.removeAttribute('style');
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  }, [editor, inFocus, selection]);

  return (
    <Portal>
      <Menu
        className="slate-hovering-toolbar-menu"
        onMouseDown={(e: MouseEvent) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault();
        }}
        ref={ref}
      >
        <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" />
        <FormatButton format="underline" icon="format_underlined" />
      </Menu>
    </Portal>
  );
};

interface FormatButtonProps {
  format: CustomTextKey;
  icon: string;
}

const handleToolbarButtonClick = (
  event: MouseEvent<HTMLButtonElement>,
  command: () => void
) => {
  if (event.detail === 0) {
    command();
  }
};

const handleToolbarButtonPointerDown = (
  event: PointerEvent<HTMLButtonElement>,
  command: () => void
) => {
  event.preventDefault();
  command();
};

const FormatButton = ({ format, icon }: FormatButtonProps) => {
  const editor = useEditor<CustomEditor>();
  const active = useEditorSelector((editor: CustomEditor) =>
    isMarkActive(editor, format)
  );
  const runCommand = () => toggleMark(editor, format);

  return (
    <Button
      active={active}
      data-test-id={`hovering-toolbar-button-${format}`}
      onClick={(event) => handleToolbarButtonClick(event, runCommand)}
      onPointerDown={(event) =>
        handleToolbarButtonPointerDown(event, runCommand)
      }
      reversed
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default HoveringMenuExample;
