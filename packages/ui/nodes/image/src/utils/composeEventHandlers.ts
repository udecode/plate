export const composeEventHandlers = <E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) => (event: E) => {
  originalEventHandler?.(event);

  if (
    checkForDefaultPrevented === false ||
    !((event as unknown) as Event).defaultPrevented
  ) {
    return ourEventHandler?.(event);
  }
};
