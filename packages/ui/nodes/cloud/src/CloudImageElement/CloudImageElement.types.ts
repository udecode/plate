import { TCloudImageElement } from '@udecode/plate-cloud';
import { Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface CloudImageElementStyleProps<V extends Value>
  extends CloudImageElementProps<V> {
  selected?: boolean;
  focused?: boolean;
}

export interface CloudImageElementProps<V extends Value>
  extends StyledElementProps<V, TCloudImageElement, CloudImageElementStyles> {}

export interface CloudImageElementStyles {
  // file: CSSProp;
  // filename: CSSProp;
  // caption: CSSProp;
  // body: CSSProp;
  // download: CSSProp;
  // downloadIcon: CSSProp;
}
