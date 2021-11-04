import { SyntheticEvent } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';
import {
  DOMHandlers,
  HandlerReturnType,
} from '../types/PlatePlugin/DOMHandlers';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';

/**
 * Check if an event is overrided by a handler.
 */
export const isEventHandled = <
  EventType extends SyntheticEvent<unknown, unknown>
>(
  event: EventType,
  handler?: (event: EventType) => void | boolean
) => {
  if (!handler) {
    return false;
  }
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.isPropagationStopped();
};

/**
 * Generic pipe for handlers.
 * - Get all the plugins handlers by `handlerKey`.
 * - If there is no plugin handler or editable prop handler for this key, return `undefined`.
 * - Return a handler calling all the plugins handlers then the prop handler.
 * - Any handler returning true will stop the next handlers to be called, including slate internal handler.
 */
export const pipeHandler = <K extends keyof DOMHandlers>(
  editor: PlateEditor,
  {
    editableProps,
    handlerKey,
    plugins,
  }: { editableProps?: EditableProps; handlerKey: K; plugins?: PlatePlugin[] }
): ((event: any) => void) | undefined => {
  let pluginsHandlers: ((event: any) => HandlerReturnType)[] = [];
  if (plugins) {
    pluginsHandlers = plugins.flatMap(
      (plugin) => plugin[handlerKey]?.(editor) ?? []
    );
  }

  const propsHandler = editableProps?.[handlerKey] as (
    event: any
  ) => HandlerReturnType | undefined;

  if (!pluginsHandlers.length && !propsHandler) return;

  return (event: any) => {
    const eventIsHandled = pluginsHandlers.some((handler) =>
      isEventHandled(event, handler)
    );
    if (eventIsHandled) return true;

    return isEventHandled(event, propsHandler);
  };
};
