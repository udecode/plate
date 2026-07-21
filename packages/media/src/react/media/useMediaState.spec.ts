import { renderHook } from '@testing-library/react';
import * as actualPlatejsReact from '@platejs/core/react';
import * as actualUtils from '@platejs/utils';

import { parseVideoUrl } from '../../lib/media-embed/parseVideoUrl';
import {
  type EmbedUrlParser,
  parseMediaUrl,
} from '../../lib/media/parseMediaUrl';

const useEditorRefMock = mock();
const useElementMock = mock();
const useEditorFocusedMock = mock();
const useEditorReadOnlyMock = mock();
const useElementSelectedMock = mock();

mock.module('@platejs/plite-react', () => ({
  useEditorFocused: useEditorFocusedMock,
  useEditorReadOnly: useEditorReadOnlyMock,
  useElementSelected: useElementSelectedMock,
}));

mock.module('@platejs/core/react', () => ({
  ...actualPlatejsReact,
  useEditorRef: useEditorRefMock,
  useElement: useElementMock,
}));

describe('parseMediaUrl', () => {
  const parsersWithoutFallback: EmbedUrlParser[] = [
    (url) => (url.startsWith('https://a.com') ? { id: 'A', url } : undefined),
    (url) => (url.endsWith('b') ? { id: 'B', url } : undefined),
  ];

  const parsersWithFallback: EmbedUrlParser[] = [
    ...parsersWithoutFallback,
    (url) => ({ id: 'C', url }),
  ];

  it('returns undefined if no parsers match', () => {
    const embed = parseMediaUrl('https://x.com', {
      urlParsers: parsersWithoutFallback,
    });
    expect(embed).toBeUndefined();
  });

  it('uses the first matching parser', () => {
    const embed1 = parseMediaUrl('https://a.com/b', {
      urlParsers: parsersWithoutFallback,
    });
    expect(embed1?.id).toBe('A');

    const embed2 = parseMediaUrl('https://x.com/b', {
      urlParsers: parsersWithoutFallback,
    });
    expect(embed2?.id).toBe('B');
  });

  it('uses fallback parser if present', () => {
    const embed = parseMediaUrl('https://alert.com', {
      urlParsers: parsersWithFallback,
    });
    expect(embed?.id).toBe('C');
  });

  it('does not allow javascript: URLs', () => {
    const embed = parseMediaUrl('javascript://alert.com', {
      urlParsers: parsersWithFallback,
    });
    expect(embed).toBeUndefined();
  });

  it('preserves sourceUrl metadata when a parser returns it', () => {
    const embed = parseMediaUrl('https://example.com/watch', {
      urlParsers: [
        () => ({
          id: 'video-1',
          provider: 'youtube',
          sourceUrl: 'https://example.com/watch',
          url: 'https://example.com/embed/1',
        }),
      ],
    });

    expect(embed).toEqual({
      id: 'video-1',
      provider: 'youtube',
      sourceUrl: 'https://example.com/watch',
      url: 'https://example.com/embed/1',
    });
  });
});

describe('useMediaState', () => {
  const renderMediaState = async (
    element: Record<string, unknown>,
    urlParsers: EmbedUrlParser[] = [parseVideoUrl]
  ) => {
    const { useMediaState } = await import(
      `./useMediaState?test=${Math.random().toString(36).slice(2)}`
    );

    useEditorRefMock.mockReturnValue({
      getType: (key: string) =>
        key === actualUtils.KEYS.mediaEmbed
          ? actualUtils.NODES.mediaEmbed
          : key,
    });
    useElementMock.mockReturnValue(element);
    useEditorFocusedMock.mockReturnValue(false);
    useEditorReadOnlyMock.mockReturnValue(false);
    useElementSelectedMock.mockReturnValue(false);

    const { result } = renderHook(() => useMediaState({ urlParsers }));

    return result.current;
  };

  beforeEach(() => {
    useEditorRefMock.mockReset();
    useElementMock.mockReset();
    useEditorFocusedMock.mockReset();
    useEditorReadOnlyMock.mockReset();
    useElementSelectedMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('does not trust serialized provider metadata when the render URL is unsafe', async () => {
    const state = await renderMediaState({
      children: [{ text: '' }],
      provider: 'vimeo',
      sourceUrl: 'https://vimeo.com/1',
      type: actualUtils.NODES.mediaEmbed,
      url: "javascript:parent.postMessage('plate-media-xss','*')",
    });

    expect(state.embed).toBeUndefined();
    expect(state.isVideo).toBe(false);
  });

  it('recomputes provider metadata from the render URL', async () => {
    const state = await renderMediaState({
      children: [{ text: '' }],
      id: 'attacker-controlled',
      provider: 'youtube',
      sourceUrl: 'https://vimeo.com/1',
      type: actualUtils.NODES.mediaEmbed,
      url: 'https://player.vimeo.com/video/76979871',
    });

    expect(state.embed).toEqual({
      id: '76979871',
      provider: 'vimeo',
      sourceKind: 'url',
      sourceUrl: undefined,
      url: 'https://player.vimeo.com/video/76979871',
    });
    expect(state.isVideo).toBe(true);
  });
});
