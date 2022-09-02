import { ReOpenThreadButtonProps } from './ReOpenThreadButton.types';

export const useReOpenThreadButton = (props: ReOpenThreadButtonProps) => {
  const { onReOpenThread } = props;

  return {
    onReOpenThread,
  } as const;
};
