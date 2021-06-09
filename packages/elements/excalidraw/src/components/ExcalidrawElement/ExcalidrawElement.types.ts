import {
  ExcalidrawProps,
  LibraryItems,
} from '@excalidraw/excalidraw-next/types/types';
import { SPRenderElementProps } from '@udecode/slate-plugins-core';
import { CSSProp } from 'styled-components';
import { ExcalidrawNodeData } from '../../types';

export interface ExcalidrawElementProps
  extends SPRenderElementProps<ExcalidrawNodeData> {
  styles?: {
    excalidrawWrapper?: CSSProp;
  };

  scrollToContent?: boolean;

  libraryItems?: LibraryItems;

  excalidrawProps?: ExcalidrawProps;
}
