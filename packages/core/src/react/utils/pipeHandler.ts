import type React from 'react';
import type { Value } from '@platejs/plite';

import type { EditableProps } from '../../lib';
import type {
  InternalPlateEditorWithInstalledPlugins,
  PlateEditor,
} from '../editor/PlateEditor';
import type { AnyResolvedPlatePlugin } from '../plugin';
import type { DOMHandlerProp, DOMHandlers } from '../plugin/DOMHandlers';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createPluginContext } from '../plugin/createPluginContext.internal';

type DOMHandlerName = keyof DOMHandlers & string;

type PluginWithDOMHandlers = AnyResolvedPlatePlugin & {
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
type PipeHandlerOptions<K extends DOMHandlerProp> = {
  handlerKey: K;
  editableProps?: Omit<EditableProps, 'decorate'> | null;
};

type PipedDOMHandler = ((event: any) => boolean | void) | undefined;

export function pipeHandler<V extends Value, D, K extends DOMHandlerProp>(
  editor: InternalPlateEditorWithInstalledPlugins<V, D>,
  options: PipeHandlerOptions<K>
): PipedDOMHandler;
export function pipeHandler<K extends DOMHandlerProp>(
  editor: object,
  { editableProps, handlerKey }: PipeHandlerOptions<K>
): PipedDOMHandler {
  const plateEditor = editor as PlateEditor;
  const propsHandler = editableProps?.[handlerKey] as (
    event: any
  ) => boolean | void;

  const pluginHandlerName = getDOMHandlerName(handlerKey);
  const relevantPlugins = (
    getPlateRuntime(plateEditor)
      .pluginList as unknown as AnyResolvedPlatePlugin[]
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
      if (isEditOnly(plateEditor.read.view.isReadOnly(), plugin, 'on')) {
        return false;
      }

      const pluginHandler = (plugin as PluginWithDOMHandlers).on?.[
        pluginHandlerName
      ] as ((ctx: any) => boolean | void) | undefined;

      if (!pluginHandler) return false;

      const shouldTreatEventAsHandled = pluginHandler({
        ...createPluginContext(plateEditor, plugin),
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
}
