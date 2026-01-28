import { defineStore, storeToRefs } from 'pinia';
import { computed, reactive, markRaw } from 'vue';
import { useSuperdocStore } from './superdoc-store';
import TextField from '@superdoc/components/HrbrFieldsLayer/TextField.vue';
import ParagraphField from '@superdoc/components/HrbrFieldsLayer/ParagraphField.vue';
import ImageField from '@superdoc/components/HrbrFieldsLayer/ImageField.vue';
import CheckboxField from '@superdoc/components/HrbrFieldsLayer/CheckboxField.vue';
import SelectField from '@superdoc/components/HrbrFieldsLayer/SelectField.vue';
import { floor } from '../helpers/floor.js';

export const useHrbrFieldsStore = defineStore('hrbr-fields', () => {
  const superdocStore = useSuperdocStore();
  const { documents } = storeToRefs(superdocStore);
  const hrbrFieldsConfig = reactive({
    name: 'hrbr-fields',
  });

  const fieldComponentsMap = Object.freeze({
    TEXTINPUT: markRaw(TextField),
    HTMLINPUT: markRaw(ParagraphField),
    SELECT: markRaw(SelectField),
    CHECKBOXINPUT: markRaw(CheckboxField),
    SIGNATUREINPUT: markRaw(ImageField),
    IMAGEINPUT: markRaw(ImageField),
  });

  const getField = (documentId, fieldId) => {
    const doc = documents.value.find((d) => d.id === documentId);
    if (!doc) return;

    const field = doc.fields.find((f) => f.id === fieldId);
    if (field) return field;
  };

  const getAnnotations = computed(() => {
    const mappedAnnotations = [];
    documents.value.forEach((doc) => {
      const { id, annotations } = doc;

      const docContainer = doc.container;
      if (!docContainer) return;

      const bounds = docContainer.getBoundingClientRect();
      const pageBoundsMap = doc.pageContainers;
      if (!bounds || !pageBoundsMap) return;

      annotations.forEach((annotation) => {
        const { itemid: fieldId, page, nostyle } = annotation;

        let annotationId = annotation.pageannotation;

        if (annotation.itemfieldtype === 'CHECKBOXINPUT') {
          annotationId = annotation.annotationid;
        }

        const { x1, y1, x2, y2 } = annotation;
        const coordinates = { x1, y1, x2, y2 };

        const pageContainer = document.getElementById(`${id}-page-${page + 1}`);
        if (!pageContainer) return;
        const pageBounds = pageContainer.getBoundingClientRect();

        const pageInfo = doc.pageContainers.find((p) => p.page === page);
        const scale = pageBounds.height / pageInfo.containerBounds.originalHeight;
        const pageBottom = pageBounds.bottom - bounds.top;
        const pageLeft = pageBounds.left - bounds.left;

        const mappedCoordinates = _mapAnnotation(coordinates, scale, pageBottom, pageLeft);
        // scale ~1.333 - for 100% scale in pdf.js (it doesn't change).
        const annotationStyle = {
          fontSize: floor(annotation.original_font_size * scale, 2) + 'pt',
          fontFamily: annotation.fontfamily || 'Arial',
          originalFontSize: floor(annotation.original_font_size * scale, 2),
          coordinates: mappedCoordinates,
        };

        const field = {
          documentId: id,
          fieldId,
          page,
          annotationId,
          originalAnnotationId: annotation.originalannotationid,
          coordinates: mappedCoordinates,
          style: annotationStyle,
          nostyle: nostyle ?? false,
        };

        mappedAnnotations.push(field);
      });
    });

    return mappedAnnotations;
  });

  const _mapAnnotation = (coordinates, scale, pageBottom, boundsLeft) => {
    const { x1, y1, x2, y2 } = coordinates;
    const mappedX1 = x1 * scale;
    const mappedY1 = y1 * scale;
    const mappedX2 = x2 * scale;
    const mappedY2 = y2 * scale;

    return {
      top: `${pageBottom - mappedY2}px`,
      left: `${mappedX1 + boundsLeft}px`,
      minWidth: `${mappedX2 - mappedX1}px`,
      minHeight: `${mappedY2 - mappedY1}px`,
    };
  };

  return {
    hrbrFieldsConfig,
    fieldComponentsMap,

    // Getters
    getAnnotations,
    getField,
  };
});
