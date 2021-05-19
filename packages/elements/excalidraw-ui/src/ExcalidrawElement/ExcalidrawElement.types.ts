import { ExcalidrawNodeData } from '@udecode/slate-plugins-excalidraw';
import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';
import { getExcalidrawElementStyles } from './ExcalidrawElement.styles';

export interface ExcalidrawElementStyleSet extends RootStyleSet {
  iframeWrapper?: IStyle;
  iframe?: IStyle;
  input?: IStyle;
}

export type ExcalidrawElementProps = StyledElementProps<
  ExcalidrawNodeData,
  ClassName,
  ExcalidrawElementStyleSet
>;
