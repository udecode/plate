export const isClickInsideThreads = (event: MouseEvent): boolean => {
  const target = event.target as HTMLElement;
  return Boolean(target?.closest?.('.threads'));
};
