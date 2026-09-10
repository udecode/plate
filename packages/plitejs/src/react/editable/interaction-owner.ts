type ExternalHostOwner = Readonly<{
  root: () => HTMLElement | null;
  focus: () => void;
  blur: () => void;
}>;

const EXTERNAL_HOSTS = new WeakMap<HTMLElement, ExternalHostOwner>();

export const registerExternalTextHost = (
  host: HTMLElement,
  owner: ExternalHostOwner
) => {
  if (EXTERNAL_HOSTS.has(host)) {
    throw new Error('Plite external text host already has an owner.');
  }
  EXTERNAL_HOSTS.set(host, owner);
  return () => {
    if (EXTERNAL_HOSTS.get(host) === owner) EXTERNAL_HOSTS.delete(host);
  };
};

export const getExternalTextHostOwner = (target: EventTarget | null) => {
  let node = target && 'nodeType' in target ? (target as Node) : null;
  while (node) {
    if (node.nodeType === 1) {
      const host = node as HTMLElement;
      const owner = EXTERNAL_HOSTS.get(host);
      if (owner && owner.root()?.contains(host)) return { host, owner };
    }
    node =
      node.parentNode ?? ('host' in node ? (node as ShadowRoot).host : null);
  }
  return null;
};

/** Registration, not a spoofable DOM attribute, grants foreign input ownership. */
export const getEditableInteractionOwner = (
  root: HTMLElement | null,
  target: EventTarget | null
) => {
  if (!root || !target || !('nodeType' in target)) return 'outside' as const;
  const external = getExternalTextHostOwner(target);
  if (external?.owner.root() === root) return 'external-text' as const;
  const node = target as Node;
  const element = node.nodeType === 1 ? (node as Element) : node.parentElement;
  if (!root.contains(node)) return 'outside' as const;
  const editor = element?.closest('[data-plite-editor="true"]');
  if (editor && editor !== root) return 'nested-editor' as const;
  if (element?.closest('input,textarea,select,button,[role="button"]')) {
    return 'control' as const;
  }
  if (element?.closest('[contenteditable="false"]')) return 'chrome' as const;
  return 'editor' as const;
};

/** Keep every React event family outside the outer editing pipeline. */
export const guardExternalTextEvents = <T extends object>(
  handlers: T,
  activate: () => void
): T =>
  Object.fromEntries(
    Object.entries(handlers).map(([name, handler]) => {
      if (!/^on[A-Z]/.test(name) || typeof handler !== 'function') {
        return [name, handler];
      }
      return [
        name,
        (event: { target: EventTarget | null; currentTarget: HTMLElement }) => {
          const external = getExternalTextHostOwner(event.target);
          if (external && event.currentTarget.contains(external.host)) {
            if (external.owner.root() === event.currentTarget) {
              if (name === 'onFocusCapture') {
                activate();
                external.owner.focus();
              } else if (name === 'onBlurCapture') external.owner.blur();
              else if (name === 'onMouseDownCapture') activate();
            }
            return undefined;
          }
          return handler(event);
        },
      ];
    })
  ) as T;
