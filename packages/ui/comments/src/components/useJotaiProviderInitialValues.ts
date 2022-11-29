// TODO: move to core
export const useJotaiProviderInitialValues = (store: any, props: any) => {
  const initialValues: any[] = [];
  Object.keys(props).forEach((key) => {
    if (key in store.atom) {
      initialValues.push([store.atom[key], props[key]]);
    }
  });

  return initialValues;
};
