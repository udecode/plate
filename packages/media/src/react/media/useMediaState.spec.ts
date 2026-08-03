import { renderHook } from '@testing-library/react';
import type { PluginReference } from '@platejs/core';
import * as actualPlatejsReact from '@platejs/core/react';
import * as actualUtils from '@platejs/utils';

import {
  type EmbedUrlParser,
  parseVideoUrl,
} from '../../lib/media/parseMediaUrl';

const useEditorMock = mock();
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
  useEditor: useEditorMock,
  useElement: useElementMock,
}));

describe('useMediaState', () => {
  const renderMediaState = async (
    element: Record<string, unknown>,
    urlParsers: EmbedUrlParser[] = [parseVideoUrl]
  ) => {
    const { useMediaState } = await import(
      `./useMediaState?test=${Math.random().toString(36).slice(2)}`
    );

    useEditorMock.mockReturnValue({
      plugin: (plugin: PluginReference | string) => {
        const name = typeof plugin === 'string' ? plugin : plugin.name;

        return {
          installed: true,
          schema: {
            element: {
              type:
                name === actualUtils.PLUGINS.mediaEmbed
                  ? 'mediaEmbed'
                  : 'video',
            },
          },
        };
      },
    });
    useElementMock.mockReturnValue(element);
    useEditorFocusedMock.mockReturnValue(false);
    useEditorReadOnlyMock.mockReturnValue(false);
    useElementSelectedMock.mockReturnValue(false);

    const { result } = renderHook(() => useMediaState({ urlParsers }));

    return result.current;
  };

  beforeEach(() => {
    useEditorMock.mockReset();
    useElementMock.mockReset();
    useEditorFocusedMock.mockReset();
    useEditorReadOnlyMock.mockReset();
    useElementSelectedMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('matches selection only when the media node itself is selected', async () => {
    const state = await renderMediaState({
      children: [{ text: 'Caption caret' }],
      type: 'mediaEmbed',
      url: 'https://platejs.org/embed',
    });

    expect(useElementSelectedMock).toHaveBeenCalledWith({ mode: 'node' });
    expect(state.selected).toBe(false);
  });

  it('does not trust serialized provider metadata when the render URL is unsafe', async () => {
    const state = await renderMediaState({
      children: [{ text: '' }],
      provider: 'vimeo',
      sourceUrl: 'https://vimeo.com/1',
      type: 'mediaEmbed',
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
      type: 'mediaEmbed',
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
