import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export type ReOpenThreadButtonStyleProps = ReOpenThreadButtonProps;

export type ReOpenThreadButtonStyles = {
  icon: CSSProp;
};

export type ReOpenThreadButtonProps = {
  onReOpenThread: () => void;
} & StyledProps<ReOpenThreadButtonStyles>;

export const useReOpenThreadButton = (props: ReOpenThreadButtonProps) => {
  const { onReOpenThread } = props;

  return {
    onReOpenThread,
  } as const;
};
