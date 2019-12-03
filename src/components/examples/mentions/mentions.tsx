/* eslint-disable no-alert */
import React, { useMemo } from 'react';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { useFocused, useSelected, useSlate, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { CustomElementProps } from 'slate-react/lib/components/custom';
import { Button, Icon, Toolbar } from '../../components';
import { initialValue, USERS } from './data';

const promptMention = (editor: Editor) => {
  const name = window.prompt('Who would you like to mention?');
  if (!name) return;
  const regex = new RegExp(`^${name}`, 'i');
  const match = Object.entries(USERS).find(([, nameValue]: any) =>
    regex.test(nameValue)
  );
  const id = match ? match[0] : 57;
  editor.exec({ type: 'insert_mention', id });
};

const withMentions = (editor: Editor) => {
  const { exec, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === 'mention' ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  editor.exec = command => {
    if (command.type === 'insert_mention') {
      const { id } = command;
      const mention = {
        type: 'mention',
        id,
        children: [{ text: '', marks: [] }],
      };
      Editor.insertNodes(editor, mention);
    } else {
      exec(command);
    }
  };

  return editor;
};

const isMentionActive = (editor: Editor) => {
  const [mention] = Editor.nodes(editor, { match: { type: 'mention' } });
  return !!mention;
};

const Element = (props: CustomElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case 'mention':
      return <MentionElement {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const MentionElement = ({
  attributes,
  children,
  element,
}: CustomElementProps) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <span
      {...attributes}
      contentEditable={false}
      style={{
        padding: '3px 3px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: '4px',
        backgroundColor: '#eee',
        fontSize: '0.9em',
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
      }}
    >
      @{USERS[element.id]}
      {children}
    </span>
  );
};

const MentionButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isMentionActive(editor)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        promptMention(editor);
      }}
    >
      <Icon>person_pin</Icon>
    </Button>
  );
};

export const Mentions = () => {
  const editor = useMemo(
    () => withMentions(withReact(withHistory(createEditor()))),
    []
  );

  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Toolbar>
        <MentionButton />
      </Toolbar>
      <Editable
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
        onKeyDown={event => {
          if (event.key === '@') {
            event.preventDefault();
            promptMention(editor);
          }
        }}
      />
    </Slate>
  );
};
