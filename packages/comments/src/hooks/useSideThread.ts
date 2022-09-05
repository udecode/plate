import { StyledProps } from '@udecode/plate-styled-components';
import { ThreadPosition, ThreadStyleProps } from '@udecode/plate-ui-comments';

export type SideThreadStyleProps = SideThreadProps;

export type SideThreadStyles = {};

export type SideThreadProps = {
  position: ThreadPosition;
  threadProps: ThreadStyleProps;
} & StyledProps<SideThreadStyles>;

export const useSideThread = (props: SideThreadProps) => {
  const { position, threadProps } = props;

  return {
    position,
    threadProps,
  } as const;
};
