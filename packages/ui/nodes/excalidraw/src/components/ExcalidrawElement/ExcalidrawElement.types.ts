import {
  ExcalidrawProps,
  LibraryItems,
} from '@excalidraw/excalidraw/types/types';
import { Value } from '@udecode/plate-common';
import { PlateElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { TExcalidrawElement } from '../../types';

export interface ExcalidrawElementStyles {
  excalidrawWrapper: CSSProp;
}

export interface ExcalidrawElementProps<V extends Value>
  extends PlateElementProps<V, TExcalidrawElement, ExcalidrawElementStyles> {
  scrollToContent?: boolean;

  libraryItems?: LibraryItems;

  excalidrawProps?: ExcalidrawProps;
}
