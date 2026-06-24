type InputEventWithDataTransfer = InputEvent & {
  readonly dataTransfer?: DataTransfer | null;
};

type InputEventWithTargetRanges = InputEvent & {
  getTargetRanges?: () => StaticRange[];
};

const getConstructorName = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? (value as { constructor?: { name?: unknown } }).constructor?.name
    : null;

export const isDataTransferInput = (value: unknown): value is DataTransfer =>
  (typeof DataTransfer === 'function' && value instanceof DataTransfer) ||
  getConstructorName(value) === 'DataTransfer';

export const getInputEventDataTransfer = (
  event: InputEvent
): DataTransfer | null => {
  const { dataTransfer } = event as InputEventWithDataTransfer;

  return isDataTransferInput(dataTransfer) ? dataTransfer : null;
};

export const getInputEventData = (
  event: InputEvent
): DataTransfer | string | null =>
  getInputEventDataTransfer(event) ?? event.data;

export const getInputEventTargetRanges = (
  event: InputEvent
): readonly StaticRange[] => {
  const { getTargetRanges } = event as InputEventWithTargetRanges;

  return typeof getTargetRanges === 'function'
    ? getTargetRanges.call(event)
    : [];
};
