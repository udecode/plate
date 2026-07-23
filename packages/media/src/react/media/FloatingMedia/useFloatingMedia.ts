import React from 'react';

import type { BaseEditor, WithRequiredKey } from '@platejs/core';
import { useEditor, useElement } from '@platejs/core/react';
import type { TMediaElement } from '@platejs/utils';
import { useHotkeys } from '@udecode/react-hotkeys';
import { isUrl as defaultIsUrl } from '@udecode/utils';

import type { MediaPluginConfig } from '../../../lib/media/types';
import {
  parseMediaUrl,
  parseTwitterUrl,
  parseVideoUrl,
} from '../../../lib/media/parseMediaUrl';
import { FloatingMediaStore } from './FloatingMediaStore';

export const submitFloatingMedia = (
  editor: BaseEditor,
  {
    element,
    plugin,
  }: {
    element: TMediaElement;
    plugin: WithRequiredKey<MediaPluginConfig>;
  }
) => {
  let url = FloatingMediaStore.get('url');

  if (url === element.url) {
    FloatingMediaStore.actions.reset();

    return true;
  }

  const { isUrl = defaultIsUrl, transformUrl } = editor
    .plugin(plugin)
    .getOptions();

  if (transformUrl) url = transformUrl(url);
  if (!isUrl(url)) return;

  const normalized = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  editor.update.nodes.set<TMediaElement>(
    {
      provider: normalized?.provider,
      sourceUrl: normalized?.sourceUrl,
      url: normalized?.url ?? url,
    },
    { at: element }
  );

  FloatingMediaStore.actions.reset();
  editor.api.dom.focus();

  return true;
};

export const useFloatingMediaEditButton = () => {
  const element = useElement<TMediaElement>();

  return {
    props: {
      onClick: React.useCallback(() => {
        FloatingMediaStore.set('url', element.sourceUrl ?? element.url);
        FloatingMediaStore.set('isEditing', true);
      }, [element.sourceUrl, element.url]),
    },
  };
};

export const useFloatingMediaUrlInputState = ({
  plugin,
}: {
  plugin: WithRequiredKey<MediaPluginConfig>;
}) => {
  const editor = useEditor();
  const element = useElement<TMediaElement>();

  useHotkeys(
    'enter',
    (event) => {
      if (submitFloatingMedia(editor, { element, plugin })) {
        event.preventDefault();
      }
    },
    { enableOnFormTags: ['INPUT'] },
    [editor, element, plugin]
  );
  useHotkeys(
    'escape',
    () => {
      if (!FloatingMediaStore.get('isEditing')) return;

      FloatingMediaStore.actions.reset();
      editor.api.dom.focus();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['INPUT'],
    },
    [editor]
  );

  return {
    defaultValue: FloatingMediaStore.get('url'),
  };
};

export const useFloatingMediaUrlInput = ({
  defaultValue,
}: ReturnType<typeof useFloatingMediaUrlInputState>) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((event) => {
      FloatingMediaStore.set('url', event.target.value);
    }, []);

  return {
    props: {
      autoFocus: true,
      defaultValue,
      onChange,
    },
  };
};
