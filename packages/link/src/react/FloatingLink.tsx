import React from 'react';

import { useEditorPlugin, usePluginOption } from '@platejs/core/react';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { LinkPlugin } from './LinkPlugin';

export const useFloatingLinkNewTabInputState = () => {
  const { getOptions } = useEditorPlugin(LinkPlugin);
  const updated = usePluginOption(LinkPlugin, 'updated');
  const ref = React.useRef<HTMLInputElement>(null);
  const [checked, setChecked] = React.useState<boolean>(getOptions().newTab);

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
  const { setOption } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        setChecked(e.target.checked);
        setOption('newTab', e.target.checked);
      },
      [setOption, setChecked]
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
  const { editor, getOptions } = useEditorPlugin(LinkPlugin);
  const updated = usePluginOption(LinkPlugin, 'updated');
  const ref = React.useRef<HTMLInputElement>(null);
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        const input = ref.current;

        if (!input) return;
        if (focused.current) return;

        focused.current = true;

        const url = getOptions().url;
        input.focus();
        input.value = url ? editor.plugin(LinkPlugin).api.decodeUrl(url) : '';
      }, 0);
    }
  }, [editor, getOptions, updated]);

  return {
    ref,
  };
};

export const useFloatingLinkUrlInput = (
  state: ReturnType<typeof useFloatingLinkUrlInputState>
) => {
  const { editor, getOptions, setOption } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        const url = editor.plugin(LinkPlugin).api.encodeUrl(e.target.value);
        setOption('url', url);
      },
      [editor, setOption]
    );

  return {
    props: {
      defaultValue: getOptions().url,
      onChange,
    },
    ref: state.ref,
  };
};

export const FloatingLinkUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkUrlInput,
  stateHook: useFloatingLinkUrlInputState,
});
