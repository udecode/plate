import { ref, reactive } from 'vue';

export function useFloatingComment(params) {
  const id = params.commentId;
  const comment = ref(params);

  const position = reactive({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const offset = ref(0);

  return {
    id,
    comment,
    position,
    offset,
  };
}
