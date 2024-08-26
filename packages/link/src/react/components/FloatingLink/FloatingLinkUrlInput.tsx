import React from 'react';

import {
  createPrimitiveComponent,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import { encodeUrlIfNeeded, safeDecodeUrl } from '../../../lib';
import { LinkPlugin } from '../../LinkPlugin';

export const useFloatingLinkUrlInputState = () => {
  const { getOptions, useOption } = useEditorPlugin(LinkPlugin);
  const updated = useOption('updated');
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        const input = ref.current;
        
                if (!input) return;
        
        const url = getOptions().url;
        input.focus();
        input.value = url ? safeDecodeUrl(url) : '';
      }, 0);
    }
  }, [getOptions, updated]);

  return {
    ref,
  };
};

export const useFloatingLinkUrlInput = (
  state: ReturnType<typeof useFloatingLinkUrlInputState>
) => {
  const { getOptions, setOption } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        const url = encodeUrlIfNeeded(e.target.value);
        setOption('url', url);
      },
      [setOption]
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
