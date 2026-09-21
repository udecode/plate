export type AnnotationStoreMetrics = Readonly<{
  annotationResolveCount: number;
  annotationSubscriberWakeCount: number;
  changedAnnotationCount: number;
  fullFallbackCount: number;
  recomputeCount: number;
}>;

const metricsByStore = new WeakMap<object, () => AnnotationStoreMetrics>();

export const registerAnnotationStoreMetrics = (
  store: object,
  readMetrics: () => AnnotationStoreMetrics
) => {
  metricsByStore.set(store, readMetrics);
};

export const getAnnotationStoreMetrics = (
  store: object
): AnnotationStoreMetrics => {
  const readMetrics = metricsByStore.get(store);

  if (!readMetrics) {
    throw new Error('Annotation store metrics are unavailable.');
  }

  return readMetrics();
};
