/**
 * Prevent default and call a handler if defined
 */
export const getPreventDefaultHandler = <T extends (...args: any) => any>(
  cb?: T,
  ...args: Parameters<T>
) => (event: any) => {
  event.preventDefault();
  cb?.(...(args as any));
};
