import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type CodeSyntaxLeafRootProps = HTMLPropsAs<'span'> & {
  attributes?: any;
};

export const useCodeSyntaxLeafRootProps = ({
  attributes,
  ...props
}: CodeSyntaxLeafRootProps): HTMLPropsAs<'pre'> => {
  return {
    ...attributes,
    ...props,
  };
};

export const CodeSyntaxLeafRoot = createComponentAs<CodeSyntaxLeafRootProps>(
  (props) => {
    const htmlProps = useCodeSyntaxLeafRootProps(props);

    return createElementAs('span', htmlProps);
  }
);
