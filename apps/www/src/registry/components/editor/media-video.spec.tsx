import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import * as actualCoreReact from '@platejs/core/react';
import * as actualDnd from '@platejs/dnd';
import * as actualMedia from '@platejs/media';
import { render } from '@testing-library/react';
import * as React from 'react';

const parseTwitterUrlMock = mock();
const parseVideoUrlMock = mock();
const parseMediaUrlMock = mock();
const useEditorMountedMock = mock();
const useDraggableMock = mock();

mock.module('@platejs/dnd', () => ({
  ...actualDnd,
  useDraggable: useDraggableMock,
}));

mock.module('@platejs/media', () => ({
  ...actualMedia,
  parseMediaUrl: parseMediaUrlMock,
  parseTwitterUrl: parseTwitterUrlMock,
  parseVideoUrl: parseVideoUrlMock,
  VIDEO_PROVIDERS: ['vimeo', 'youtube'],
}));

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  PlateElement: ({ children }: any) => (
    <div data-testid="plate-element">{children}</div>
  ),
  useEditor: () => ({
    plugin: () => ({ update: { set: () => {} } }),
    read: { selection: () => null },
  }),
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    selector({
      read: { selection: () => null },
    }),
  useElement: () => ({ children: [{ text: '' }], type: 'video' }),
  useEditorMounted: useEditorMountedMock,
  useEditorReadOnly: () => false,
  useElementSelected: () => false,
  usePath: () => [0],
}));

mock.module('react-lite-youtube-embed', () => ({
  default: ({ id }: any) => <div data-id={id} data-testid="youtube-embed" />,
}));

mock.module('react-player', () => ({
  default: ({ src }: any) => <div data-src={src} data-testid="react-player" />,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./resize-handle', () => ({
  mediaResizeHandleVariants: () => '',
  Resizable: ({ children }: any) => (
    <div data-testid="resizable">{children}</div>
  ),
  ResizeHandle: () => <div data-testid="resize-handle" />,
}));

describe('VideoElement', () => {
  const editor = {
    api: {
      suggestion: {
        suggestionData: () => null,
      },
    },
    read: { selection: () => null },
  } as any;

  beforeEach(() => {
    parseTwitterUrlMock.mockReset();
    parseVideoUrlMock.mockReset();
    parseMediaUrlMock.mockReset();
    useEditorMountedMock.mockReset();
    useDraggableMock.mockReset();

    useEditorMountedMock.mockReturnValue(true);
    useDraggableMock.mockReturnValue({});
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders a player for plain video URLs inserted via URL', async () => {
    parseMediaUrlMock.mockReturnValue(undefined);

    const { VideoElement } = await import(
      `./media-video?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <VideoElement
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            type: 'video',
            url: 'https://cdn.example.com/video.mp4',
          } as any
        }
        editor={editor}
        path={[0]}
        slots={
          {
            contentBoundary: () => <div data-testid="caption-boundary" />,
          } as any
        }
      >
        {null}
      </VideoElement>
    );

    expect(view.container.querySelector('video')?.getAttribute('src')).toBe(
      'https://cdn.example.com/video.mp4'
    );
    expect(view.queryByTestId('youtube-embed')).toBeNull();
    expect(view.queryByTestId('react-player')).toBeNull();
  });

  it('keeps the youtube embed path for youtube videos', async () => {
    parseMediaUrlMock.mockReturnValue({ id: 'abc123', provider: 'youtube' });

    const { VideoElement } = await import(
      `./media-video?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <VideoElement
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            type: 'video',
            url: 'https://www.youtube.com/watch?v=abc123',
          } as any
        }
        editor={editor}
        path={[0]}
        slots={
          {
            contentBoundary: () => <div data-testid="caption-boundary" />,
          } as any
        }
      >
        {null}
      </VideoElement>
    );

    expect(view.getByTestId('youtube-embed').getAttribute('data-id')).toBe(
      'abc123'
    );
    expect(view.queryByTestId('react-player')).toBeNull();
  });

  it('uses ReactPlayer for non-youtube video providers', async () => {
    parseMediaUrlMock.mockReturnValue({
      id: '76979871',
      provider: 'vimeo',
    });

    const { VideoElement } = await import(
      `./media-video?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <VideoElement
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            type: 'video',
            url: 'https://vimeo.com/76979871',
          } as any
        }
        editor={editor}
        path={[0]}
        slots={
          {
            contentBoundary: () => <div data-testid="caption-boundary" />,
          } as any
        }
      >
        {null}
      </VideoElement>
    );

    expect(view.getByTestId('react-player').getAttribute('data-src')).toBe(
      'https://vimeo.com/76979871'
    );
    expect(view.container.querySelector('video')).toBeNull();
    expect(view.queryByTestId('youtube-embed')).toBeNull();
  });
});
