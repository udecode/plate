import { act, render } from '@testing-library/react';
import {
  type Value,
  type Element,
  screenReaderAnnouncementEffect,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { type ReactNode, useLayoutEffect, useRef } from 'react';

import { createEditor, EditorRoot, useRootEditor } from '../../src/react';
import { EditorAnnouncementLiveRegion } from '../../src/react/components/editor-announcement-live-region';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('screen-reader announcement live region', () => {
  it('replaces repeated messages so assistive technology observes a mutation', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const rendered = render(
      <EditorRoot editor={editor}>
        <div />
      </EditorRoot>
    );
    const region = rendered.getByRole('status');

    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('role', 'status');

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Saved');
      });
    });

    const firstMessageNode = region.firstChild;

    expect(region).toHaveTextContent('Saved');

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Saved');
      });
    });

    expect(region).toHaveTextContent('Saved');
    expect(region.firstChild).not.toBe(firstMessageNode);
  });

  it('renders one consumer for all roots of one logical editor', () => {
    const editor = createEditor<Value>({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <div />
        <EditorRoot editor={editor} root="header">
          <div />
        </EditorRoot>
      </EditorRoot>
    );

    expect(rendered.getAllByRole('status')).toHaveLength(1);

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Header updated');
      });
    });

    expect(rendered.getByRole('status')).toHaveTextContent('Header updated');
  });

  it('does not add a second consumer for nested views of the same document', () => {
    const editor = createEditor<Value>({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const SameEditorView = () => {
      const mounted = useRootEditor();

      return (
        <EditorRoot editor={mounted}>
          <div />
        </EditorRoot>
      );
    };
    const SameRootEditorView = () => {
      const rootEditor = useRootEditor('header');

      return (
        <EditorRoot editor={rootEditor}>
          <div />
        </EditorRoot>
      );
    };
    const rendered = render(
      <EditorRoot editor={editor}>
        <SameEditorView />
        <SameRootEditorView />
      </EditorRoot>
    );

    expect(rendered.getAllByRole('status')).toHaveLength(1);
  });

  it('speaks once across independent authored roots and keeps speaking after the speaker unmounts', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('body')],
    });
    const accepted = render(
      <EditorRoot
        authored={{ intent: 'edit', projection: 'accepted' }}
        editor={editor}
      >
        <div />
      </EditorRoot>
    );
    const proposed = render(
      <EditorRoot
        authored={{ intent: 'propose', projection: 'proposed' }}
        editor={editor}
      >
        <div />
      </EditorRoot>
    );

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Shared update');
      });
    });

    expect([
      accepted.container.textContent,
      proposed.container.textContent,
    ]).toEqual(['Shared update', '']);

    accepted.unmount();
    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Still mounted');
      });
    });
    expect(proposed.container).toHaveTextContent('Still mounted');
  });

  it('speaks from the region nearest the focused element', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const rendered = render(
      <>
        <section>
          <EditorRoot editor={editor}>
            <button type="button">First view</button>
          </EditorRoot>
        </section>
        <section>
          <EditorRoot editor={editor}>
            <button type="button">Second view</button>
          </EditorRoot>
        </section>
      </>
    );

    rendered.getByText('Second view').focus();
    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Moved up');
      });
    });

    expect(
      rendered.getAllByRole('status').map((region) => region.textContent)
    ).toEqual(['', 'Moved up']);

    rendered.getByText('First view').focus();
    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Moved down');
      });
    });

    expect(
      rendered.getAllByRole('status').map((region) => region.textContent)
    ).toEqual(['Moved down', '']);
  });

  it('speaks from an audible region before a nearer hidden one', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const rendered = render(
      <>
        <section>
          <button type="button">Header</button>
          {/* @ts-expect-error React types aria-hidden as a boolean string, but the DOM attribute value is case-insensitive */}
          <div aria-hidden="TRUE">
            <EditorRoot editor={editor}>
              <div />
            </EditorRoot>
          </div>
        </section>
        <section>
          <EditorRoot editor={editor}>
            <div />
          </EditorRoot>
        </section>
      </>
    );

    rendered.getByText('Header').focus();
    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Moved up');
      });
    });

    expect(
      [...rendered.container.querySelectorAll('[role="status"]')].map(
        (region) => region.textContent
      )
    ).toEqual(['', 'Moved up']);
  });

  it('skips a region slotted under an inert shadow wrapper', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const SlotHost = ({ children }: { children: ReactNode }) => {
      const hostRef = useRef<HTMLDivElement>(null);

      useLayoutEffect(() => {
        const host = hostRef.current;

        if (!host) return;

        const inertWrapper = document.createElement('div');
        const firstSlot = document.createElement('slot');
        const secondSlot = document.createElement('slot');

        inertWrapper.setAttribute('inert', '');
        firstSlot.name = 'first';
        secondSlot.name = 'second';
        inertWrapper.append(firstSlot);
        host.attachShadow({ mode: 'open' }).append(inertWrapper, secondSlot);
      }, []);

      return <div ref={hostRef}>{children}</div>;
    };
    const rendered = render(
      <>
        <SlotHost>
          <section slot="first">
            <EditorRoot editor={editor}>
              <div />
            </EditorRoot>
          </section>
          <section slot="second">
            <EditorRoot editor={editor}>
              <div />
            </EditorRoot>
          </section>
        </SlotHost>
        <button type="button">Toolbar</button>
      </>
    );

    rendered.getByText('Toolbar').focus();
    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Moved up');
      });
    });

    expect(
      [...rendered.container.querySelectorAll('[role="status"]')].map(
        (region) => region.textContent
      )
    ).toEqual(['', 'Moved up']);
  });

  it('ends on the later message when a commit listener nests an update', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    let nested = false;

    editor.subscribeCommit(() => {
      if (nested) return;

      nested = true;
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Second');
      });
    });

    const rendered = render(
      <EditorRoot editor={editor}>
        <div />
      </EditorRoot>
    );

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'First');
      });
    });

    expect(rendered.getByRole('status')).toHaveTextContent('Second');
  });

  it('keeps the outer message when a commit listener nests a silent update', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    let nested = false;

    editor.subscribeCommit(() => {
      if (nested) return;

      nested = true;
      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        });
      });
    });

    const rendered = render(
      <EditorRoot editor={editor}>
        <div />
      </EditorRoot>
    );

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Moved up');
      });
    });

    expect(rendered.getByRole('status')).toHaveTextContent('Moved up');
  });

  it('consumes root-editor announcements while the mounted view is read-only', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const rendered = render(
      <EditorRoot editor={editor} readOnly>
        <div />
      </EditorRoot>
    );

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Read-only status');
      });
    });

    expect(rendered.getByRole('status')).toHaveTextContent('Read-only status');
  });

  it('starts a replacement editor from its current commit baseline', () => {
    const firstEditor = createEditor({
      initialValue: [paragraph('first')],
    });
    const secondEditor = createEditor({
      initialValue: [paragraph('second')],
    });
    const rendered = render(
      <EditorAnnouncementLiveRegion editor={firstEditor} />
    );

    act(() => {
      firstEditor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'First editor');
      });
      secondEditor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Old second commit');
      });
    });

    expect(rendered.container).toHaveTextContent('First editor');

    rendered.rerender(<EditorAnnouncementLiveRegion editor={secondEditor} />);

    expect(rendered.container).not.toHaveTextContent('First editor');
    expect(rendered.container).not.toHaveTextContent('Old second commit');

    act(() => {
      firstEditor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Stale first editor');
      });
      secondEditor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Second editor');
      });
    });

    expect(rendered.container).toHaveTextContent('Second editor');
    expect(rendered.container).not.toHaveTextContent('Stale first editor');
  });
});
