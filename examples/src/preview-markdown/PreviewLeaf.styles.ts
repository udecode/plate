import { createStyles, StyledProps } from '@udecode/plate';
import { CSSProp } from 'styled-components';

export interface PreviewLeafStyleProps extends StyledProps {
  bold?: boolean;
  italic?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
  code?: boolean;
}

export const getPreviewLeafStyles = (props: PreviewLeafStyleProps) => {
  const { title, list, italic, hr, code, bold, blockquote } = props;

  const boldStyle: CSSProp = {
    fontWeight: 'bold',
  };

  const italicStyle: CSSProp = {
    fontStyle: 'italic',
  };

  const titleStyle: CSSProp = {
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '20px 0 10px 0',
  };

  const listStyle: CSSProp = {
    paddingLeft: '10px',
    fontSize: '20px',
    lineHeight: '10px',
  };

  const hrStyle: CSSProp = {
    display: 'block',
    textAlign: 'center',
    borderBottom: '2px solid #ddd',
  };

  const blockquoteStyle: CSSProp = {
    display: 'inline-block',
    borderLeft: '2px solid #ddd',
    paddingLeft: '10px',
    color: '#aaa',
    fontStyle: 'italic',
  };

  const codeStyle: CSSProp = {
    fontFamily: 'monospace',
    backgroundColor: '#eee',
    padding: '3px',
  };

  let rootStyle: CSSProp = {};

  if (bold) rootStyle = { ...rootStyle, ...boldStyle };
  if (italic) rootStyle = { ...rootStyle, ...italicStyle };
  if (title) rootStyle = { ...rootStyle, ...titleStyle };
  if (list) rootStyle = { ...rootStyle, ...listStyle };
  if (hr) rootStyle = { ...rootStyle, ...hrStyle };
  if (blockquote) rootStyle = { ...rootStyle, ...blockquoteStyle };
  if (code) rootStyle = { ...rootStyle, ...codeStyle };

  return createStyles(
    { prefixClassNames: 'PreviewLeaf', ...props },
    {
      rootVariants: [rootStyle],
    }
  );
};
