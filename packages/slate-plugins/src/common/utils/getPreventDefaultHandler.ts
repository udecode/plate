/**
 * Prevent default and call a handler
 */
export const getPreventDefaultHandler = <T extends (...args: any) => any>(
  cb: T,
  ...args: Parameters<T>
) => (event: Event) => {
  event.preventDefault();
  cb(...(args as any));
};
