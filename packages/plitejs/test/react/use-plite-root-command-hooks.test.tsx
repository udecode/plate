import { act, fireEvent, render, screen } from '@testing-library/react';
import { editorCommands, NodeApi } from 'plitejs';
import { useLayoutEffect } from 'react';

import {
  createEditor,
  Editable,
  EditorRoot,
  useCommand,
  useRootEffect,
} from '../../src/react';

const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];

describe('plite-react root and command hooks', () => {
  test('usePliteRootEffect runs after child layout effects with the committed root editor', () => {
    const editor = createEditor({ initialValue });
    const calls: Array<{
      childLayoutSeen: string | null;
      root: string | undefined;
    }> = [];

    const Probe = () => {
      useLayoutEffect(() => {
        screen
          .getByTestId('root-effect-root')
          .setAttribute('data-child-layout', 'ready');
      }, []);

      useRootEffect((rootEditor) => {
        calls.push({
          childLayoutSeen: screen
            .getByTestId('root-effect-root')
            .getAttribute('data-child-layout'),
          root: rootEditor.read((state) => state.view.root()),
        });
      });

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Editable data-testid="root-effect-root" />
        <Probe />
      </EditorRoot>
    );

    expect(calls).toEqual([{ childLayoutSeen: 'ready', root: undefined }]);
  });

  test('usePliteRootEffect stays registered across editor commits', async () => {
    const editor = createEditor({ initialValue });
    const calls: string[] = [];

    const Probe = () => {
      useRootEffect(
        (rootEditor) => {
          calls.push(
            rootEditor.read((state) => {
              const [firstBlock] = state.nodes.children();
              return firstBlock ? NodeApi.string(firstBlock) : '';
            })
          );
        },
        { deps: [] }
      );

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Editable />
        <Probe />
      </EditorRoot>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(calls).toEqual(['test', 'test!']);
  });

  test('usePliteRootEffect with explicit deps ignores focus-only context changes', async () => {
    const editor = createEditor({ initialValue });
    const calls: string[] = [];
    const cleanups: string[] = [];

    const Probe = () => {
      useRootEffect(
        () => {
          calls.push('effect');

          return () => {
            cleanups.push('cleanup');
          };
        },
        { deps: [] }
      );

      return null;
    };

    render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Editor" />
        <Probe />
      </EditorRoot>
    );

    await act(async () => {
      fireEvent.focusIn(screen.getByLabelText('Editor'));
      fireEvent.focusOut(screen.getByLabelText('Editor'));
    });

    expect(calls).toEqual(['effect']);
    expect(cleanups).toEqual([]);
  });

  test('usePliteRootEffect reruns when deps change without an editor commit', () => {
    const editor = createEditor({ initialValue });
    const calls: string[] = [];

    const Probe = ({ label }: { label: string }) => {
      useRootEffect(
        () => {
          calls.push(label);
        },
        { deps: [label] }
      );

      return null;
    };

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable />
        <Probe label="first" />
      </EditorRoot>
    );

    expect(calls).toEqual(['first']);

    rendered.rerender(
      <EditorRoot editor={editor}>
        <Editable />
        <Probe label="second" />
      </EditorRoot>
    );

    expect(calls).toEqual(['first', 'second']);
  });

  test('usePliteRootEffect without deps reruns on React rerenders', () => {
    const editor = createEditor({ initialValue });
    const calls: string[] = [];

    const Probe = ({ label }: { label: string }) => {
      useRootEffect(() => {
        calls.push(label);
      });

      return null;
    };

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable />
        <Probe label="first" />
      </EditorRoot>
    );

    expect(calls).toEqual(['first']);

    rendered.rerender(
      <EditorRoot editor={editor}>
        <Editable />
        <Probe label="second" />
      </EditorRoot>
    );

    expect(calls).toEqual(['first', 'second']);
  });

  test('usePliteCommand binds a stable typed dispatcher and receives input at invocation time', () => {
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
