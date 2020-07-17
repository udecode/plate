import { IStyle } from '@uifabric/styling';
import { PreviewLeafStyleProps, PreviewLeafStyles } from './PreviewLeaf.types';

export const getPreviewLeafStyles = ({
  className,
  title,
  list,
  italic,
  hr,
  code,
  bold,
  blockquote,
}: PreviewLeafStyleProps): PreviewLeafStyles => {
  const boldStyle: IStyle = {
    fontWeight: 'bold',
  };

  const italicStyle: IStyle = {
    fontStyle: 'italic',
  };

  const titleStyle: IStyle = {
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '20px 0 10px 0',
  };

  const listStyle: IStyle = {
    paddingLeft: '10px',
    fontSize: '20px',
    lineHeight: '10px',
  };

  const hrStyle: IStyle = {
    display: 'block',
    textAlign: 'center',
    borderBottom: '2px solid #ddd',
  };

  const blockquoteStyle: IStyle = {
    display: 'inline-block',
    borderLeft: '2px solid #ddd',
    paddingLeft: '10px',
    color: '#aaa',
    fontStyle: 'italic',
  };

  const codeStyle: IStyle = {
    fontFamily: 'monospace',
    backgroundColor: '#eee',
    padding: '3px',
  };

  let rootStyle: IStyle = {};

  if (bold) rootStyle = { ...rootStyle, ...boldStyle };
  if (italic) rootStyle = { ...rootStyle, ...italicStyle };
  if (title) rootStyle = { ...rootStyle, ...titleStyle };
  if (list) rootStyle = { ...rootStyle, ...listStyle };
  if (hr) rootStyle = { ...rootStyle, ...hrStyle };
  if (blockquote) rootStyle = { ...rootStyle, ...blockquoteStyle };
  if (code) rootStyle = { ...rootStyle, ...codeStyle };

  return {
    root: [rootStyle, className],
  };
};
