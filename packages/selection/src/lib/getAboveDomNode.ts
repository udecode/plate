export const querySelectorSelectable = (id: string) => {
  return document.querySelector(`.slate-selectable[data-block-id="${id}"]`);
};

export const querySelectorAllSelectable = () => {
  return document.querySelectorAll(`.slate-selectable`);
};
