import { MediaEmbedNodeData } from '@udecode/slate-plugins-media-embed';
import { StyledElementProps } from '@udecode/slate-plugins-ui';
import { CSSProp } from 'styled-components';

export interface MediaEmbedElementStyles {
  iframeWrapper: CSSProp;
  iframe: CSSProp;
  input: CSSProp;
}

export type MediaEmbedElementProps = StyledElementProps<
  MediaEmbedNodeData,
  MediaEmbedElementStyles
>;
