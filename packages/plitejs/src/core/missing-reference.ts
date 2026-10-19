/**
 * A draft names something the document does not hold yet, such as a record a
 * collaborator has not sent, so a collaboration binding waits for more input
 * instead of failing. A refusal carries it as its cause.
 */
export class EditorMissingReferenceError extends Error {
  override name = 'EditorMissingReferenceError';
}

export const isMissingReference = (error: unknown): boolean => {
  for (
    let current: unknown = error;
    current instanceof Error;
    current = current.cause
  ) {
    if (current instanceof EditorMissingReferenceError) return true;
  }

  return false;
};
