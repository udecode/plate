import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  mergeProps,
  useComposedRef,
} from '@udecode/plate-common';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkNewTabInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
  const updated = useFloatingLinkSelectors().updated();
  const ref = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState<boolean>(
    floatingLinkSelectors.newTab()
  );

  useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }, [updated]);

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setChecked(e.target.checked);
    floatingLinkActions.newTab(e.target.checked);
  }, []);

  return mergeProps(
    {
      onChange,
      checked,
      type: 'checkbox',
    },
    { ...props, ref: useComposedRef<HTMLInputElement>(props.ref, ref) }
  );
};

export const FloatingLinkNewTabInput = createComponentAs<AsProps<'input'>>(
  (props) => {
    const htmlProps = useFloatingLinkNewTabInput(props);

    return createElementAs('input', htmlProps);
  }
);
