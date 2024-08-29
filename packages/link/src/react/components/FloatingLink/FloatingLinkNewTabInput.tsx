import React from 'react';

import {
  createPrimitiveComponent,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import { LinkPlugin } from '../../LinkPlugin';

export const useFloatingLinkNewTabInputState = () => {
  const { getOptions, useOption } = useEditorPlugin(LinkPlugin);
  const updated = useOption('updated');
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
      onChange,
      type: 'checkbox',
    },
    ref,
  };
};

export const FloatingLinkNewTabInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkNewTabInput,
  stateHook: useFloatingLinkNewTabInputState,
});
