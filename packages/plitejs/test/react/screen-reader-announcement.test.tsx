import { act, render } from '@testing-library/react';
import {
  type Value,
  type Element,
  screenReaderAnnouncementEffect,
} from 'plitejs';
import { authored } from 'plitejs/authored';

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

  it('keeps independent authored roots and announcement lifetimes separate', () => {
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

    expect(accepted.container.querySelectorAll('[role="status"]')).toHaveLength(
      1
    );
    expect(proposed.container.querySelectorAll('[role="status"]')).toHaveLength(
      1
    );

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Shared update');
      });
    });

    expect(accepted.container).toHaveTextContent('Shared update');
    expect(proposed.container).toHaveTextContent('Shared update');

    accepted.unmount();
    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Still mounted');
      });
    });
    expect(proposed.container).toHaveTextContent('Still mounted');
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
