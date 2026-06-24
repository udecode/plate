import { act, fireEvent, render, screen } from '@testing-library/react';
import { useLayoutEffect } from 'react';

import {
  createReactEditor,
  Editable,
  Plite,
  usePliteCommandCallback,
  usePliteRootEffect,
} from '../src';

const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];

describe('plite-react root and command hooks', () => {
  test('usePliteRootEffect runs after child layout effects with the committed root editor', () => {
    const editor = createReactEditor({ initialValue });
    const calls: { childLayoutSeen: string | null; root: string }[] = [];

    const Probe = () => {
      useLayoutEffect(() => {
        screen
          .getByTestId('root-effect-root')
          .setAttribute('data-child-layout', 'ready');
      }, []);

      usePliteRootEffect((rootEditor) => {
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
      <Plite editor={editor}>
        <Editable data-testid="root-effect-root" />
        <Probe />
      </Plite>
    );

    expect(calls).toEqual([{ childLayoutSeen: 'ready', root: 'main' }]);
  });

  test('usePliteRootEffect stays registered across editor commits', async () => {
    const editor = createReactEditor({ initialValue });
    const calls: string[] = [];

    const Probe = () => {
      usePliteRootEffect(
        (rootEditor) => {
          calls.push(
            rootEditor.read((state) => {
              const [firstBlock] = state.nodes.children() as {
                children: { text: string }[];
              }[];

              return firstBlock?.children[0]?.text ?? '';
            })
          );
        },
        { deps: [] }
      );

      return null;
    };

    render(
      <Plite editor={editor}>
        <Editable />
        <Probe />
      </Plite>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(calls).toEqual(['test', 'test!']);
  });

  test('usePliteRootEffect with explicit deps ignores focus-only context changes', async () => {
    const editor = createReactEditor({ initialValue });
    const calls: string[] = [];
    const cleanups: string[] = [];

    const Probe = () => {
      usePliteRootEffect(
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
      <Plite editor={editor}>
        <Editable aria-label="Editor" />
        <Probe />
      </Plite>
    );

    await act(async () => {
      fireEvent.focusIn(screen.getByLabelText('Editor'));
      fireEvent.focusOut(screen.getByLabelText('Editor'));
    });

    expect(calls).toEqual(['effect']);
    expect(cleanups).toEqual([]);
  });

  test('usePliteRootEffect reruns when deps change without an editor commit', () => {
    const editor = createReactEditor({ initialValue });
    const calls: string[] = [];

    const Probe = ({ label }: { label: string }) => {
      usePliteRootEffect(
        () => {
          calls.push(label);
        },
        { deps: [label] }
      );

      return null;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable />
        <Probe label="first" />
      </Plite>
    );

    expect(calls).toEqual(['first']);

    rendered.rerender(
      <Plite editor={editor}>
        <Editable />
        <Probe label="second" />
      </Plite>
    );

    expect(calls).toEqual(['first', 'second']);
  });

  test('usePliteRootEffect without deps reruns on React rerenders', () => {
    const editor = createReactEditor({ initialValue });
    const calls: string[] = [];

    const Probe = ({ label }: { label: string }) => {
      usePliteRootEffect(() => {
        calls.push(label);
      });

      return null;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable />
        <Probe label="first" />
      </Plite>
    );

    expect(calls).toEqual(['first']);

    rendered.rerender(
      <Plite editor={editor}>
        <Editable />
        <Probe label="second" />
      </Plite>
    );

    expect(calls).toEqual(['first', 'second']);
  });

  test('usePliteCommandCallback keeps a stable handler while calling the latest callback with the target root editor', () => {
    const editor = createReactEditor({
      initialValue: {
        children: initialValue,
        roots: { header: [{ type: 'block', children: [{ text: 'head' }] }] },
      },
    });
    const calls: { label: string; root: string }[] = [];
    const handlers: unknown[] = [];

    const CommandButton = ({ label }: { label: string }) => {
      const command = usePliteCommandCallback(
        (rootEditor) => {
          calls.push({
            label,
            root: rootEditor.read((state) => state.view.root()),
          });
        },
        { root: 'header' }
      );

      handlers.push(command);

      return (
        <button onClick={() => command()} type="button">
          Run command
        </button>
      );
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Body editor" />
        <CommandButton label="first" />
      </Plite>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run command' }));

    rendered.rerender(
      <Plite editor={editor}>
        <Editable aria-label="Header editor" root="header" />
        <Editable aria-label="Body editor" />
        <CommandButton label="second" />
      </Plite>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run command' }));

    expect(handlers[0]).toBe(handlers[1]);
    expect(calls).toEqual([
      { label: 'first', root: 'header' },
      { label: 'second', root: 'header' },
    ]);
  });
});
