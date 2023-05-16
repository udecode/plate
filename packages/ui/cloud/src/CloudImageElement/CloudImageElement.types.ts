import { TCloudImageElement } from '@udecode/plate-cloud';
import { Value } from '@udecode/plate-common';
import { PlateElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { CloudStatusBarStyles } from '../StatusBar/StatusBar.types';

export interface CloudImageElementStyleProps<V extends Value>
  extends CloudImageElementProps<V> {
  selected?: boolean;
  focused?: boolean;
}

export interface CloudImageElementProps<V extends Value>
  extends PlateElementProps<V, TCloudImageElement, CloudImageElementStyles> {}

export interface CloudImageElementStyles extends CloudStatusBarStyles {
  img: CSSProp;
  statusBarContainer: CSSProp;
  // filename: CSSProp;
  // caption: CSSProp;
  // body: CSSProp;
  // download: CSSProp;
  // downloadIcon: CSSProp;
}
