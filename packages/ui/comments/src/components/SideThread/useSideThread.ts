import { SideThreadProps } from './SideThread.types';

export const useSideThread = (props: SideThreadProps) => {
  const { position, threadProps } = props;

  return {
    position,
    threadProps,
  } as const;
};
