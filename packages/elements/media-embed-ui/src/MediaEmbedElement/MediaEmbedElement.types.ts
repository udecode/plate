import { MediaEmbedNodeData } from '@udecode/slate-plugins-media-embed';
import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';

export interface MediaEmbedElementStyleSet extends RootStyleSet {
  iframeWrapper?: IStyle;
  iframe?: IStyle;
  input?: IStyle;
}

export type MediaEmbedElementProps = StyledElementProps<
  MediaEmbedNodeData,
  ClassName,
  MediaEmbedElementStyleSet
>;
