import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type CodeBlockElementPreProps = HTMLPropsAs<'pre'> & {
  attributes?: any;
  nodeProps?: any;
};

export const useCodeBlockElementPreProps = ({
  attributes,
  nodeProps,
  ...props
}: CodeBlockElementPreProps): HTMLPropsAs<'pre'> => {
  return {
    ...attributes,
    ...nodeProps,
    ...props,
  };
};
export const CodeBlockElementPre = createComponentAs<CodeBlockElementPreProps>(
  (props) => {
    const htmlProps = useCodeBlockElementPreProps(props);

    return createElementAs('pre', htmlProps);
  }
);
