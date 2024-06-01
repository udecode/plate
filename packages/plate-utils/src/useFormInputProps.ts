interface InputProps {
  /**
   * Should we activate the onKeyDownCapture handler to preventDefault when
   * the user presses enter?
   */
  preventDefaultOnEnterKeydown?: boolean;
  /**
   * A user provided callback which will be called after event.preventDefault
   *
   * @param e The original event
   * @returns nothing
   */
  onKeyDownCaptureCallback?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Hook to allow the user to spread a set of predefined props to the Div wrapper
 * of an Input element
 *
 * @param param0 an options object which can be expanded to add further functionality
 * @returns a props object which can be spread onto the element
 */
export const useFormInputProps = (options?: InputProps) => {
  // Nothing provided to just return an empty object which can still be spread.
  // If we need to add more functionality later we will still be able to do so
  if (!options) return { props: {} };

  // Destructure our options so we can use them
  const { preventDefaultOnEnterKeydown, onKeyDownCaptureCallback } = options;

  /**
   * Handle the keydown capture event and prevent the default behaviour when the
   * user presses enter.
   *
   * In the event the user presses enter on a field such as a link, prior to
   * filling in both label and url, the default behaviour is to submit the form.
   * This, ultimately, results in no link being added as you need to fill both
   * fields to pass validation.
   *
   * By calling preventDefault we short circuit the form's submission thus
   * allowing the user to continue filling in the other fields
   *
   * @param e The original event which was provided by the VDOM
   * @param userProvidedCallback A user provided callback which will allow them to
   * implement their own behaviour on this event
   */
  const handleEnterKeydownCapture = (
    e: React.KeyboardEvent<HTMLDivElement>,
    userProvidedCallback?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  ) => {
    // Prevent the form from submitting
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
    }

    // Call the user provided callback, if it exists and provide them with the
    // original event object
    userProvidedCallback?.(e);
  };
  return {
    props: {
      onKeyDownCapture: preventDefaultOnEnterKeydown
        ? (e: React.KeyboardEvent<HTMLDivElement>) =>
            handleEnterKeydownCapture(e, onKeyDownCaptureCallback)
        : undefined,
    },
  };
};
