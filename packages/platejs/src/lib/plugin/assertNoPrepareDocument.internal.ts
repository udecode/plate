export const assertNoPrepareDocument = (value: object): void => {
  if (!Object.hasOwn(value, 'prepareDocument')) return;

  throw new Error(
    'Plate plugin `prepareDocument` is unsupported. Convert persisted documents before creating or replacing an editor value.'
  );
};
