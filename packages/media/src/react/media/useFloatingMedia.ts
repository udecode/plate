import React from 'react';

import { useEditor, useElement } from '@platejs/core/react';
import { useHotkeys } from '@udecode/react-hotkeys';

import type { MediaPlugin } from '../plugins';
import { FloatingMediaStore } from './FloatingMediaStore';

export const useFloatingMediaEditButton = ({
  plugin,
}: {
  plugin: MediaPlugin;
}) => {
  const element = useElement(plugin);

  return {
    props: {
      onClick: React.useCallback(() => {
        const sourceUrl =
          'sourceUrl' in element && typeof element.sourceUrl === 'string'
            ? element.sourceUrl
            : undefined;

        FloatingMediaStore.set('url', sourceUrl ?? element.url);
        FloatingMediaStore.set('isEditing', true);
      }, [element]),
    },
  };
};

export const useFloatingMediaUrlInputState = ({
  plugin,
}: {
  plugin: MediaPlugin;
}) => {
  const editor = useEditor();
  const element = useElement(plugin);

  useHotkeys(
    'enter',
    (event) => {
      const url = FloatingMediaStore.get('url');

      if (
        url !== element.url &&
        !editor.plugin(plugin).update.setUrl({ element, url })
      )
        return;

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
