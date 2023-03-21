import { TCodeBlockElement } from '@udecode/plate-code-block';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  useElementProps,
  Value,
} from '@udecode/plate-common';

export type CodeBlockElementRootProps = PlateRenderElementProps<
  Value,
  TCodeBlockElement
> &
  HTMLPropsAs<'pre'>;

export const useCodeBlockElementRootProps = (
  props: CodeBlockElementRootProps
): HTMLPropsAs<'pre'> => {
  return { ...useElementProps(props) };
};
export const CodeBlockElementRoot = createComponentAs<CodeBlockElementRootProps>(
  (props) => {
    const htmlProps = useCodeBlockElementRootProps(props);

    return createElementAs('pre', htmlProps);
  }
);
