export type PageItem = {
  box: { height: number; left: number; top: number; width: number };
  editor?: number;
  name: string;
  role: string;
};

export const listPageItems = ({ ios }: { ios: boolean }): PageItem[] => {
  const editorRoots = '[data-editor="true"],[data-slate-editor="true"]';
  const controls =
    'a[href],button,input:not([type="hidden"]),select,summary,textarea,[role="button"],[role="checkbox"],[role="combobox"],[role="link"],[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="option"],[role="radio"],[role="switch"],[role="tab"]';
  const view = window.visualViewport;
  // Safari's client rects already follow the keyboard's scroll.
  const viewTop = ios ? 0 : (view?.offsetTop ?? 0);
  const viewLeft = ios ? 0 : (view?.offsetLeft ?? 0);
  const editors = [...document.querySelectorAll(editorRoots)];

  const shownBox = (element: Element) => {
    const rect = element.getBoundingClientRect();
    let top = Math.max(rect.top, viewTop);
    let left = Math.max(rect.left, viewLeft);
    let bottom = Math.min(rect.bottom, viewTop + (view?.height ?? innerHeight));
    let right = Math.min(rect.right, viewLeft + (view?.width ?? innerWidth));

    for (
      let node = element;
      node.parentElement && getComputedStyle(node).position !== 'fixed';
      node = node.parentElement
    ) {
      const holder = node.parentElement;
      const style = getComputedStyle(holder);
      const box = holder.getBoundingClientRect();

      if (style.overflowX !== 'visible') {
        left = Math.max(left, box.left);
        right = Math.min(right, box.right);
      }
      if (style.overflowY !== 'visible') {
        top = Math.max(top, box.top);
        bottom = Math.min(bottom, box.bottom);
      }
    }
    if (right - left < 1 || bottom - top < 1) return null;
    if (
      !element.contains(
        document.elementFromPoint((left + right) / 2, (top + bottom) / 2)
      )
    ) {
      return null;
    }
    return { height: bottom - top, left, top, width: right - left };
  };

  const roleOf = (element: Element) => {
    const role = element.getAttribute('role');

    if (role) return role;

    const tag = element.tagName.toLowerCase();

    if (tag === 'a') return 'link';
    if (tag === 'select') return 'combobox';
    if (tag === 'summary') return 'button';
    if (tag === 'input') {
      const { type } = element as HTMLInputElement;

      if (type === 'checkbox' || type === 'radio') return type;
      return type === 'button' || type === 'submit' ? 'button' : 'textbox';
    }
    return tag === 'textarea' ? 'textbox' : 'button';
  };

  const nameOf = (element: Element) => {
    const text =
      element.getAttribute('aria-label') ??
      element.getAttribute('title') ??
      element.getAttribute('placeholder') ??
      element.textContent ??
      '';

    return text.replaceAll(/\s+/g, ' ').trim().slice(0, 60);
  };

  const items: PageItem[] = [];

  for (const element of document.querySelectorAll(
    `${editorRoots},${controls}`
  )) {
    const box = shownBox(element);

    if (!box) continue;

    const editor = editors.indexOf(element);

    items.push(
      editor === -1
        ? { box, name: nameOf(element), role: roleOf(element) }
        : {
            box,
            editor: editor + 1,
            name: nameOf(element),
            role: 'editor',
          }
    );
  }
  return items;
};

export const scrollPage = ({
  at,
  dy,
}: {
  at: { x: number; y: number } | null;
  dy: number;
}) => {
  let box = at ? document.elementFromPoint(at.x, at.y) : null;

  while (
    box &&
    !(
      /(?:auto|scroll)/.test(getComputedStyle(box).overflowY) &&
      box.scrollHeight > box.clientHeight + 1
    )
  ) {
    box = box.parentElement;
  }
  if (box) {
    box.scrollBy({ behavior: 'instant', top: dy });
    return { page: false, top: box.scrollTop };
  }
  window.scrollBy({ behavior: 'instant', top: dy });
  return { page: true, top: window.scrollY };
};

export const watchKeys = () => {
  const store = window as unknown as Record<symbol, string[] | undefined>;
  const keys = Symbol.for('plate-drive-keys');

  if (!store[keys]) {
    const seen: string[] = [];

    store[keys] = seen;
    window.addEventListener('keydown', (event) => seen.push(event.key), true);
  }
  store[keys].length = 0;
  return true;
};

export const takeKeys = () => {
  const seen =
    (window as unknown as Record<symbol, string[] | undefined>)[
      Symbol.for('plate-drive-keys')
    ] ?? [];

  return seen.splice(0);
};
