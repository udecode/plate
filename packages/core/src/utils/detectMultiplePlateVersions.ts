if (
  (import.meta as any).env?.MODE !== 'production' &&
  'document' in globalThis
) {
  if ((globalThis as any).__DETECT_MULTIPLE_PLATE_VERSIONS__ === undefined) {
    (globalThis as any).__DETECT_MULTIPLE_PLATE_VERSIONS__ = {
      numberOfVersions: 0,
      shownWarning: false,
    };
  }

  const store = (globalThis as any).__DETECT_MULTIPLE_PLATE_VERSIONS__ as {
    numberOfVersions: number;
    shownWarning: boolean;
  };

  if (++store.numberOfVersions > 1 && !store.shownWarning) {
    store.shownWarning = true;
    console.error(
      'Multiple versions of `@udecode/plate-core` have been loaded. This can result in errors when using hooks like `useEditorRef`. Please ensure that all Plate packages have compatible versions to avoid loading `@udecode/plate-core` multiple times.'
    );
  }
}

// Just loading this file is enough to trigger the warning
export const detectMultiplePlateVersions = () => {};
