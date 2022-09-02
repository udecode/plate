import { StyledProps } from '@udecode/plate-styled-components';
import { ThreadPosition } from '../../types';
import { ThreadStyleProps } from '../Thread/Thread.types';

export interface SideThreadStyleProps extends SideThreadProps {}

export interface SideThreadStyles {}

export interface SideThreadProps extends StyledProps<SideThreadStyles> {
  position: ThreadPosition;
  threadProps: ThreadStyleProps;
}
