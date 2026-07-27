import React from 'react';

import { useEditorPlugin, usePluginStore } from '@platejs/core/react';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { LinkPlugin } from './LinkPlugin';

export const useFloatingLinkNewTabInputState = () => {
  const { store } = useEditorPlugin(LinkPlugin);
  const updated = usePluginStore(LinkPlugin, 'updated');
  const ref = React.useRef<HTMLInputElement>(null);
  const [checked, setChecked] = React.useState<boolean>(store.get().newTab);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }, [updated]);

  return {
    checked,
    ref,
    setChecked,
  };
};

export const useFloatingLinkNewTabInput = ({
  checked,
  ref,
  setChecked,
}: ReturnType<typeof useFloatingLinkNewTabInputState>) => {
  const { store } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        setChecked(e.target.checked);
        store.set({ newTab: e.target.checked });
      },
      [store, setChecked]
    );

  return {
    props: {
      checked,
      type: 'checkbox',
      onChange,
    },
    ref,
  };
};

export const FloatingLinkNewTabInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkNewTabInput,
  stateHook: useFloatingLinkNewTabInputState,
});

export const useFloatingLinkUrlInputState = () => {
  const { editor, store } = useEditorPlugin(LinkPlugin);
  const updated = usePluginStore(LinkPlugin, 'updated');
  const ref = React.useRef<HTMLInputElement>(null);
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        const input = ref.current;

        if (!input) return;
        if (focused.current) return;

        focused.current = true;

        const url = store.get().url;
        input.focus();
        input.value = url ? editor.plugin(LinkPlugin).api.decodeUrl(url) : '';
      }, 0);
    }
  }, [editor, store, updated]);

  return {
    ref,
  };
};

export const useFloatingLinkUrlInput = (
  state: ReturnType<typeof useFloatingLinkUrlInputState>
) => {
  const { editor, store } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        const url = editor.plugin(LinkPlugin).api.encodeUrl(e.target.value);
        store.set({ url });
      },
      [editor, store]
    );

  return {
    props: {
      defaultValue: store.get().url,
      onChange,
    },
    ref: state.ref,
  };
};

export const FloatingLinkUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkUrlInput,
  stateHook: useFloatingLinkUrlInputState,
});
