import { ref, reactive, toRaw } from 'vue';

export default function useSelection(params) {
  const documentId = ref(params.documentId);
  const page = ref(params.page);
  const selectionBounds = reactive(params.selectionBounds || {});
  const source = ref(params.source);

  /* Get the ID of the container */
  const getContainerId = () => `${documentId.value}-page-${page.value}`;

  /* Get the location of the container */
  const getContainerLocation = (parentContainer) => {
    if (!parentContainer) return { top: 0, left: 0 };
    const parentBounds = parentContainer.getBoundingClientRect();
    const container = document.getElementById(getContainerId());

    let containerBounds = {
      top: 0,
      left: 0,
    };
    if (container) containerBounds = container.getBoundingClientRect();

    return {
      top: Number((containerBounds.top - parentBounds.top).toFixed(3)),
      left: Number((containerBounds.left - parentBounds.left).toFixed(3)),
    };
  };

  const getValues = () => {
    return {
      documentId: documentId.value,
      page: page.value,
      selectionBounds: toRaw(selectionBounds),
      source: source.value,
    };
  };

  return {
    documentId,
    page,
    selectionBounds,
    source,

    // Actions
    getValues,
    getContainerId,
    getContainerLocation,
  };
}
