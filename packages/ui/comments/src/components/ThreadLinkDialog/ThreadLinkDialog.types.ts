import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ThreadLinkDialogStyleProps extends ThreadLinkDialogProps {}

export interface ThreadLinkDialogStyles {
  closeButton: CSSProp;
  icon: CSSProp;
}

export interface ThreadLinkDialogProps
  extends StyledProps<ThreadLinkDialogStyles> {
  onClose: () => void;
  threadLink: string;
}
