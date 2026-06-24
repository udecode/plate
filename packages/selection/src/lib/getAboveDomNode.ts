export const querySelectorSelectable = (id: string) =>
  document.querySelector(`.plite-selectable[data-block-id="${id}"]`);

export const querySelectorAllSelectable = () =>
  document.querySelectorAll('.plite-selectable');
