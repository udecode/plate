import { SPEditor } from '../../plugins/useSlatePluginsPlugin';

/**
 * Function used to handle beforeInput events.
 * The return value indicates whether the next handler should run and defaults
 * to true.
 * To prevent the next handler from running return false.
 */
export type OnDOMBeforeInput = (
  editor: SPEditor
) => (event: Event) => boolean | undefined | void;
