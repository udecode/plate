import { EditableProps } from 'slate-react/dist/components/editable';
import { DOMHandlers } from '../types/SlatePlugin/DOMHandlers';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Generic pipe for handlers.
 * - Get all the plugins handlers by `handlerKey`.
 * - If there is no plugin handler or editable prop handler for this key, return `undefined`.
 * - Return a handler calling all the plugins handlers until one returns `false`.
 * - Call the props handler if defined.
 */
export const pipeHandler = <K extends keyof DOMHandlers>(
  editor: SPEditor,
  {
    editableProps,
    handlerKey,
    plugins,
  }: { editableProps?: EditableProps; handlerKey: K; plugins?: SlatePlugin[] }
): ((event: any) => void) | undefined => {
  let pluginsHandlers: ((event: any) => boolean | void)[] = [];
  if (plugins) {
    pluginsHandlers = plugins.flatMap(
      (plugin) => plugin[handlerKey]?.(editor) ?? []
    );
  }

  const propsHandler = editableProps?.[handlerKey];

  if (!pluginsHandlers.length && !propsHandler) return;

  return (event: Event) => {
    pluginsHandlers.some((handler) => handler(event) === false);

    propsHandler?.(event as any);
  };
};
