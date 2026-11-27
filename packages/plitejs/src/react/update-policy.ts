import {
  PLITE_REACT_PRESERVE_SELECTION_TAGS,
  withPliteReactPreservedSelection,
} from '../internal/update-policy';

export {
  PLITE_REACT_PRESERVE_SELECTION_TAGS,
  withPliteReactPreservedSelection,
};

/** Selection-effect policies owned by the editor React runtime. */
export const ReactUpdatePolicy = Object.freeze({
  preserveSelection: Object.freeze({
    tags: PLITE_REACT_PRESERVE_SELECTION_TAGS,
  }),
});
