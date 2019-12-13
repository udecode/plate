import React from 'react';
import { Editor } from 'slate';
import { OnKeyDown, Plugin, RenderElementProps } from 'slate-react';
import { MentionElement } from './MentionElement';

export const withMention = (editor: Editor) => {
  const { exec, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === 'mention' ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  editor.exec = command => {
    if (command.type === 'insert_mention') {
      const mention = {
        type: 'mention',
        character: command.character,
        children: [{ text: '' }],
      };

      Editor.insertNodes(editor, mention);
      Editor.move(editor);
    } else {
      exec(command);
    }
  };

  return editor;
};

export const renderElementMention = (props: RenderElementProps) => {
  const { element } = props;
  switch (element.type) {
    case 'mention':
      return <MentionElement {...props} />;
    default:
      break;
  }
};

export const onKeyDownMention: OnKeyDown = (
  e,
  { editor, chars, index, target, setIndex, setTarget }
) => {
  if (target) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
        setIndex(prevIndex);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
        setIndex(nextIndex);
        break;
      }
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        Editor.select(editor, target);
        editor.exec({ type: 'insert_mention', character: chars[index] });
        setTarget(null);
        break;
      case 'Escape':
        e.preventDefault();
        setTarget(null);
        break;
      default:
        break;
    }
  }
};

export const MentionPlugin = (): Plugin => ({
  editor: withMention,
  renderElement: renderElementMention,
  onKeyDown: onKeyDownMention,
});
