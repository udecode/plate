import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type CodeSyntaxLeafTokenProps = HTMLPropsAs<'span'> & {
  leaf: any;
};
export const useCodeSyntaxLeafTokenProps = ({
  leaf,
  ...props
}: CodeSyntaxLeafTokenProps) => {
  return {
    className: `prism-token token ${leaf.tokenType}`,
    ...props,
  };
};
export const CodeSyntaxLeafToken = createComponentAs<CodeSyntaxLeafTokenProps>(
  (props) => {
    const htmlProps = useCodeSyntaxLeafTokenProps(props);

    return createElementAs('span', htmlProps);
  }
);
