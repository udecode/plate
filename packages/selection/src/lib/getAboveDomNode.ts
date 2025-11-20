export const querySelectorSelectable = (id: string) =>
  document.querySelector(`.slate-selectable[data-block-id="${id}"]`);

export const querySelectorAllSelectable = () =>
  document.querySelectorAll('.slate-selectable');
