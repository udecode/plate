import { usePlateSelectors } from '../createPlateStore';

/** Get the closest `Plate` id. */
export const useEditorId = (): string =>
  usePlateSelectors(undefined, { debugHookName: 'useEditorId' }).editor().id;
