import { RefObject } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { FetchContacts, RetrieveUser } from '../../types';

export interface ResolvedThreadsStyleProps extends ResolvedThreadsProps {}

export interface ResolvedThreadsStyles {
  header: CSSProp;
  body: CSSProp;
}

export interface ResolvedThreadsProps
  extends StyledProps<ResolvedThreadsStyles> {
  renderContainer: HTMLElement;
  fetchContacts: FetchContacts;
  onClose: () => void;
  parent: RefObject<HTMLElement>;
  retrieveUser: RetrieveUser;
}
