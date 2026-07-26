import React from 'react';

import { useEditor, useElement } from '@platejs/core/react';
import { createZustandStore } from '@platejs/core/react/internal';
import type { TMediaElement } from '@platejs/utils';
import { useHotkeys } from '@udecode/react-hotkeys';
import { createPrimitiveComponent } from '@udecode/react-utils';

import type { MediaPluginReference } from '../../lib/media/types';

export const FloatingMediaStore = createZustandStore(
  {
    isEditing: false,
    url: '',
  },
  {
    mutative: true,
    name: 'floatingMedia',
  }
).extendActions(({ set }) => ({
  reset: () => {
    set('url', '');
    set('isEditing', false);
  },
}));

export const {
  useState: useFloatingMediaState,
  useValue: useFloatingMediaValue,
} = FloatingMediaStore;

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
  plugin: MediaPluginReference;
}) => {
  const editor = useEditor();
  const element = useElement<TMediaElement>();

  useHotkeys(
    'enter',
    (event) => {
      const url = FloatingMediaStore.get('url');
      const properties = editor.plugin(plugin).api.normalizeUrl(url);

      if (url !== element.url) {
        if (!properties) return;

        editor.update.nodes.set<TMediaElement>(
          {
            provider: properties.provider,
            sourceUrl: properties.sourceUrl,
            url: properties.url,
          },
          { at: element }
        );
      }

      FloatingMediaStore.actions.reset();
      editor.api.dom.focus();
      event.preventDefault();
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

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
});

export const FloatingMediaUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingMediaUrlInput,
  stateHook: useFloatingMediaUrlInputState,
});

export const FloatingMedia = {
  EditButton: FloatingMediaEditButton,
  UrlInput: FloatingMediaUrlInput,
};
