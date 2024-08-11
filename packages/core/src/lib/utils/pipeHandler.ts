import type React from 'react';

import type { TEditableProps } from '@udecode/slate-react';

import type { PlateEditor } from '../editor';
import type { DOMHandlers } from '../plugin/types/DOMHandlers';

export const convertDomEventToSyntheticEvent = (
  domEvent: Event
): React.SyntheticEvent<unknown, unknown> => {
  let propagationStopped = false;

  return {
    ...domEvent,
    bubbles: domEvent.bubbles,
    cancelable: domEvent.cancelable,
    currentTarget: domEvent.currentTarget!,
    defaultPrevented: domEvent.defaultPrevented,
    eventPhase: domEvent.eventPhase,
    isDefaultPrevented: () => domEvent.defaultPrevented,
    isPropagationStopped: () => propagationStopped,
    isTrusted: domEvent.isTrusted,
    nativeEvent: domEvent,
    persist: () => {
      throw new Error(
        'persist is not implemented for synthetic events created using convertDomEventToSyntheticEvent'
      );
    },
    preventDefault: () => domEvent.preventDefault(),
    stopPropagation: () => {
      propagationStopped = true;
      domEvent.stopPropagation();
    },
    target: domEvent.target!,
    timeStamp: domEvent.timeStamp,
    type: domEvent.type,
  };
};

/** Check if an event is overrided by a handler. */
export const isEventHandled = <
  EventType extends React.SyntheticEvent<unknown, unknown>,
>(
  event: EventType,
  handler?: (event: EventType) => boolean | void
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
 *
 * - Get all the plugins handlers by `handlerKey`.
 * - If there is no plugin handler or editable prop handler for this key, return
 *   `undefined`.
 * - Return a handler calling all the plugins handlers then the prop handler.
 * - Any handler returning true will stop the next handlers to be called,
 *   including slate internal handler.
 */
export const pipeHandler = <K extends keyof DOMHandlers>(
  editor: PlateEditor,
  {
    editableProps,
    handlerKey,
  }: { editableProps?: Omit<TEditableProps, 'decorate'> | null; handlerKey: K }
): ((event: any) => void) | undefined => {
  const propsHandler = editableProps?.[handlerKey] as (
    event: any
  ) => boolean | void;

  const relevantPlugins = editor.plugins.filter(
    (plugin) => plugin.handlers?.[handlerKey]
  );

  if (relevantPlugins.length === 0 && !propsHandler) return;

  return (event: any) => {
    const isDomEvent = event instanceof Event;
    const handledEvent = isDomEvent
      ? convertDomEventToSyntheticEvent(event)
      : event;

    const eventIsHandled = relevantPlugins.some((plugin) => {
      const pluginHandler = plugin.handlers[handlerKey]!;

      const shouldTreatEventAsHandled = pluginHandler({
        editor,
        event: handledEvent,
        plugin,
      });

      if (shouldTreatEventAsHandled != null) {
        return shouldTreatEventAsHandled;
      }

      return false;
    });

    if (eventIsHandled) return true;

    return isEventHandled(handledEvent, propsHandler);
  };
};
