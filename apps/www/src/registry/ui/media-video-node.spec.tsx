import * as React from 'react';

import * as actualCoreReact from '@platejs/core/react';
import * as actualMedia from '@platejs/media';
import * as actualMediaReact from '@platejs/media/react';
import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useDraggableMock = mock();
const parseTwitterUrlMock = mock();
const parseVideoUrlMock = mock();
const useMediaStateMock = mock();
const useResizableValueMock = mock();
const useEditorMountedMock = mock();

mock.module('@platejs/dnd', () => ({
  useDraggable: useDraggableMock,
}));

mock.module('@platejs/media', () => ({
  ...actualMedia,
  parseTwitterUrl: parseTwitterUrlMock,
  parseVideoUrl: parseVideoUrlMock,
}));

mock.module('@platejs/media/react', () => ({
  ...actualMediaReact,
  useMediaState: useMediaStateMock,
  VideoPlugin: { name: 'video' },
}));

mock.module('@platejs/resizable', () => ({
  ResizableProvider: ({ children }: any) => <>{children}</>,
  useResizableValue: useResizableValueMock,
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
  withHOC: (_Provider: any, Component: any) => Component,
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
  withResizableProvider: (Component: React.ComponentType) => Component,
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
    useDraggableMock.mockReset();
    parseTwitterUrlMock.mockReset();
    parseVideoUrlMock.mockReset();
    useMediaStateMock.mockReset();
    useResizableValueMock.mockReset();
    useEditorMountedMock.mockReset();

    useDraggableMock.mockReturnValue({
      handleRef: undefined,
      isDragging: false,
    });
    useResizableValueMock.mockReturnValue('100%');
    useEditorMountedMock.mockReturnValue(true);
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders a player for plain video URLs inserted via URL', async () => {
    useMediaStateMock.mockReturnValue({
      embed: undefined,
      isVideo: false,
      isUpload: false,
      isYoutube: false,
      readOnly: false,
      textAlign: 'center',
      unsafeUrl: 'https://cdn.example.com/video.mp4',
    });

    const { VideoElement } = await import(
      `./media-video-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <VideoElement
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            type: 'video',
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
    useMediaStateMock.mockReturnValue({
      embed: { id: 'abc123' },
      isVideo: true,
      isUpload: false,
      isYoutube: true,
      readOnly: false,
      textAlign: 'center',
      unsafeUrl: 'https://www.youtube.com/watch?v=abc123',
    });

    const { VideoElement } = await import(
      `./media-video-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <VideoElement
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            type: 'video',
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
    useMediaStateMock.mockReturnValue({
      embed: { id: '76979871', provider: 'vimeo' },
      isVideo: true,
      isUpload: false,
      isYoutube: false,
      readOnly: false,
      textAlign: 'center',
      unsafeUrl: 'https://vimeo.com/76979871',
    });

    const { VideoElement } = await import(
      `./media-video-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <VideoElement
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            type: 'video',
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
