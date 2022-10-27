import { TCloudAttachmentElement } from '@udecode/plate-cloud';
import { Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface CloudAttachmentElementStyleProps<V extends Value>
  extends CloudAttachmentElementProps<V> {
  selected?: boolean;
  focused?: boolean;
}

export interface CloudAttachmentElementProps<V extends Value>
  extends StyledElementProps<
    V,
    TCloudAttachmentElement,
    CloudAttachmentElementStyles
  > {}

export interface CloudAttachmentElementStyles {
  file: CSSProp;
  fileIcon: SVGSVGElement;
  body: CSSProp;
  download: CSSProp;
  downloadIcon: SVGSVGElement;
}
