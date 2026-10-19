import type React from 'react';

type EditableKeyDownHandler = (
  event: React.KeyboardEvent<HTMLDivElement>
) => boolean;

const handlers = new WeakMap<Element, EditableKeyDownHandler>();

export const claimEditableKeyDown = (
  element: Element,
  handler: EditableKeyDownHandler
) => {
  handlers.set(element, handler);

  return () => {
    if (handlers.get(element) === handler) handlers.delete(element);
  };
};

export const runClaimedEditableKeyDown = (
  event: React.KeyboardEvent<HTMLDivElement>
) => handlers.get(event.currentTarget)?.(event) ?? false;
