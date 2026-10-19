import { fireEvent, render, screen } from '@testing-library/react';
import { editorCommands, NodeApi } from 'plitejs';

import {
  createEditor,
  Editable,
  EditorRoot,
  useCommand,
} from '../../src/react';

const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];

describe('plite-react useCommand', () => {
  test('useCommand binds a stable typed dispatcher and receives input at invocation time', () => {
    const editor = createEditor({
      initialValue: {
        children: initialValue,
        roots: { header: [{ type: 'block', children: [{ text: 'head' }] }] },
      },
    });
    const handlers: unknown[] = [];

    const CommandButton = ({ label }: { label: string }) => {
      const command = useCommand(editorCommands.insertText, {
        root: 'header',
      });

      handlers.push(command);

      return (
        <button onClick={() => command({ text: label })} type="button">
          Run command
        </button>
      );
    };

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Body editor" />
        <CommandButton label="first" />
      </EditorRoot>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run command' }));

    rendered.rerender(
      <EditorRoot editor={editor}>
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Body editor" />
        <CommandButton label="second" />
      </EditorRoot>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run command' }));

    expect(handlers[0]).toBe(handlers[1]);
    expect(
      editor.read
        .root('header')
        .map((node) => NodeApi.string(node))
        .join('')
    ).toBe('headfirstsecond');
  });
});
