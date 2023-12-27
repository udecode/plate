/**
 * @see https://github.com/radix-ui/primitives/blob/b324ec2d7ddf13a2a115cb5b11478e24d2f45b87/packages/core/primitive/src/primitive.tsx#L1
 */
export const composeEventHandlers =
  <E>(
    originalEventHandler?: (event: E) => void,
    ourEventHandler?: (event: E) => void,
    { checkForDefaultPrevented = true } = {}
  ) =>
  (event: E) => {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
