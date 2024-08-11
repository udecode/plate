import { type PlateId, usePlateSelectors } from '../createPlateStore';

/** Get the closest `Plate` id. */
export const useEditorId = (): PlateId =>
  usePlateSelectors(undefined, { debugHookName: 'useEditorId' }).editor().id;
