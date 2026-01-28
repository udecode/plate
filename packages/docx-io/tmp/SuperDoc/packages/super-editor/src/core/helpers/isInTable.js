export const isInTable = (state) => {
  const { $head } = state.selection;

  for (let d = $head.depth; d > 0; d -= 1) {
    if ($head.node(d).type?.spec?.tableRole === 'row') {
      return true;
    }
  }

  return false;
};
