import {
  type Descendant,
  screenReaderAnnouncementEffect,
} from '@platejs/plite';
import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  createReactEditor,
  Plite,
  PliteRuntime,
  usePliteRootEditor,
  usePliteRuntime,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('screen-reader announcement live region', () => {
  it('replaces repeated messages so assistive technology observes a mutation', () => {
    const editor = createReactEditor({ initialValue: [paragraph('body')] });
    const rendered = render(
      <Plite editor={editor}>
        <div />
      </Plite>
    );
    const region = rendered.container.querySelector('[data-plite-announcer]')!;

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
    let runtime!: ReturnType<typeof usePliteRuntime>;

    const Runtime = ({ children }: { children: ReactNode }) => {
      runtime = usePliteRuntime({
        initialValue: {
          children: [paragraph('body')],
          roots: { header: [paragraph('header')] },
        },
      });

      return <PliteRuntime runtime={runtime}>{children}</PliteRuntime>;
    };
    const rendered = render(
      <Runtime>
        <Plite>
          <div />
        </Plite>
        <Plite root="header">
          <div />
        </Plite>
      </Runtime>
    );

    expect(
      rendered.container.querySelectorAll('[data-plite-announcer]')
    ).toHaveLength(1);

    act(() => {
      runtime.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Header updated');
      });
    });

    expect(
      rendered.container.querySelector('[data-plite-announcer]')
    ).toHaveTextContent('Header updated');
  });

  it('does not add a second consumer when Plite receives its enclosing runtime editor', () => {
    const Runtime = ({ children }: { children: ReactNode }) => {
      const runtime = usePliteRuntime({
        initialValue: {
          children: [paragraph('body')],
          roots: { header: [paragraph('header')] },
        },
      });

      return <PliteRuntime runtime={runtime}>{children}</PliteRuntime>;
    };
    const SameEditorView = () => {
      const runtime = usePliteRuntime();

      return (
        <Plite editor={runtime.editor}>
          <div />
        </Plite>
      );
    };
    const SameRootEditorView = () => {
      const editor = usePliteRootEditor('header');

      return (
        <Plite editor={editor}>
          <div />
        </Plite>
      );
    };
    const SameRuntimeProvider = ({ children }: { children: ReactNode }) => {
      const runtime = usePliteRuntime();

      return <PliteRuntime runtime={runtime}>{children}</PliteRuntime>;
    };
    const rendered = render(
      <Runtime>
        <SameRuntimeProvider>
          <SameEditorView />
          <SameRootEditorView />
        </SameRuntimeProvider>
      </Runtime>
    );

    expect(
      rendered.container.querySelectorAll('[data-plite-announcer]')
    ).toHaveLength(1);
  });

  it('consumes root-editor announcements while the mounted view is read-only', () => {
    const editor = createReactEditor({ initialValue: [paragraph('body')] });
    const rendered = render(
      <Plite editor={editor} readOnly>
        <div />
      </Plite>
    );

    act(() => {
      editor.update((tx) => {
        tx.effects.emit(screenReaderAnnouncementEffect, 'Read-only status');
      });
    });

    expect(
      rendered.container.querySelector('[data-plite-announcer]')
    ).toHaveTextContent('Read-only status');
  });
});
