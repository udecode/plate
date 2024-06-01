import { useFormInputProps } from './useFormInputProps';

describe('useFormInputProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('will return an object with a props key regardless of whether the user provides a callback or sets preventDefaultOnEnterKeydown to true', () => {
    const output = useFormInputProps();
    expect(output.props).toBeDefined();
    expect(Object.keys(output.props)).toHaveLength(0);
  });

  it('will return a callback for onKeyDownCapture when preventDefaultOnEnterKeydown is true', () => {
    const output = useFormInputProps({ preventDefaultOnEnterKeydown: true });
    expect(output.props).toBeDefined();
    expect(Object.keys(output.props)).toHaveLength(1);
    expect(output.props.onKeyDownCapture).toBeDefined();
    expect(output.props.onKeyDownCapture instanceof Function).toBe(true);
  });

  it('will call the user provided onKeyDownCaptureCallback and pass it the original event when the returned event handler is executes', () => {
    const userCallback = jest.fn();
    const output = useFormInputProps({
      preventDefaultOnEnterKeydown: true,
      onKeyDownCaptureCallback: userCallback,
    });
    const fakeEvent = {} as any;
    // call the event handler
    output.props?.onKeyDownCapture?.(fakeEvent);
    expect(userCallback).toHaveBeenCalledTimes(1);
    expect(userCallback).toHaveBeenCalledWith(fakeEvent);
  });

  it('will call event.preventDefault if the key is enter, and only if the key is enter', () => {
    // Define mock for preventdefault
    const preventDefaultMock = jest.fn();
    // should trigger preventDefault
    const eventWithEKeyEnter = {
      key: 'Enter',
      preventDefault: preventDefaultMock,
    } as any;
    // should trigger preventDefault
    const eventWithKeyCode13 = {
      keyCode: 13,
      preventDefault: preventDefaultMock,
    } as any;
    // should not trigger preventDefault
    const eventWithIrrelevantKey = {
      keyCode: 30,
      preventDefault: preventDefaultMock,
    } as any;

    const output = useFormInputProps({
      preventDefaultOnEnterKeydown: true,
    });

    // call with enter key
    output.props?.onKeyDownCapture?.(eventWithEKeyEnter);
    expect(preventDefaultMock).toHaveBeenCalledTimes(1);

    // call with keyCode 13
    output.props?.onKeyDownCapture?.(eventWithKeyCode13);
    expect(preventDefaultMock).toHaveBeenCalledTimes(2);

    // call with irrelevant key
    output.props?.onKeyDownCapture?.(eventWithIrrelevantKey);
    expect(preventDefaultMock).toHaveBeenCalledTimes(2);
  });
});
