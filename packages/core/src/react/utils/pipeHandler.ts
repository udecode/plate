import type React from 'react';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin';
import type { DOMHandlerProp, DOMHandlers } from '../plugin/DOMHandlers';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createPluginContext } from '../plugin/createPluginContext.internal';

type DOMHandlerName = keyof DOMHandlers & string;

type PluginWithDOMHandlers = AnyEditorPlatePlugin & {
  on?: DOMHandlers;
};

const getDOMHandlerName = (handlerKey: DOMHandlerProp): DOMHandlerName => {
  if (handlerKey === 'onDOMBeforeInput') return 'domBeforeInput';

  return `${handlerKey[2]!.toLowerCase()}${handlerKey.slice(3)}` as DOMHandlerName;
};

const convertDomEventToSyntheticEvent = (
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
    isTrusted: domEvent.isTrusted,
    nativeEvent: domEvent,
    target: domEvent.target!,
    timeStamp: domEvent.timeStamp,
    type: domEvent.type,
    isDefaultPrevented: () => domEvent.defaultPrevented,
    isPropagationStopped: () => propagationStopped,
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
  };
};

/** Check if an event is overridden by a handler. */
const isEventHandled = <
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
 * Generic pipe for DOM events.
 *
 * - Get every plugin event by the matching prefixless event name.
 * - If there is no plugin event or editable prop handler for this key, return
 *   `undefined`.
 * - Return a handler calling every plugin event then the prop handler.
 * - Any callback returning true will stop the next callbacks,
 *   including the Plite internal handler.
 */
export const pipeHandler = <K extends DOMHandlerProp>(
  editor: PlateEditor<any, any>,
  {
    editableProps,
    handlerKey,
  }: { handlerKey: K; editableProps?: Omit<EditableProps, 'decorate'> | null }
): ((event: any) => boolean | void) | undefined => {
  const propsHandler = editableProps?.[handlerKey] as (
    event: any
  ) => boolean | void;

  const pluginHandlerName = getDOMHandlerName(handlerKey);
  const relevantPlugins = (
    getPlateRuntime(editor).pluginList as unknown as AnyEditorPlatePlugin[]
  ).filter(
    (plugin) => (plugin as PluginWithDOMHandlers).on?.[pluginHandlerName]
  );

  if (relevantPlugins.length === 0 && !propsHandler) return;

  return (event: any) => {
    const isDomEvent = event instanceof Event;
    const handledEvent = isDomEvent
      ? convertDomEventToSyntheticEvent(event)
      : event;

    const eventIsHandled = relevantPlugins.some((plugin) => {
      if (isEditOnly(editor.read.view.isReadOnly(), plugin, 'on')) {
        return false;
      }

      const pluginHandler = (plugin as PluginWithDOMHandlers).on?.[
        pluginHandlerName
      ] as ((ctx: any) => boolean | void) | undefined;

      if (!pluginHandler) return false;

      const shouldTreatEventAsHandled = pluginHandler({
        ...createPluginContext(editor, plugin),
        event: handledEvent,
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
