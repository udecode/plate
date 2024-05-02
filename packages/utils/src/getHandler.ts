/** Call a handler if defined */
export const getHandler =
  <T extends (...args: any) => any>(cb?: T, ...args: Parameters<T>) =>
  () => {
    cb?.(...(args as any));
  };
