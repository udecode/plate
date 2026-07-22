type TrustedHTMLPolicy = Readonly<{
  createHTML: (html: string) => null | unknown;
}>;

type TrustedTypePolicyFactory = Readonly<{
  createPolicy: (
    name: string,
    rules: Readonly<{ createHTML: (html: string) => string }>
  ) => TrustedHTMLPolicy;
  defaultPolicy?: TrustedHTMLPolicy | null;
}>;

const TRUSTED_HTML_POLICY_CACHE_KEY = Symbol.for(
  '@platejs/plite-dom/trusted-html-policy-cache'
);

const getTrustedHTMLPolicyCache = () => {
  const scope = globalThis as unknown as Record<PropertyKey, unknown>;
  const existing = scope[TRUSTED_HTML_POLICY_CACHE_KEY];

  if (existing instanceof WeakMap) {
    return existing as WeakMap<object, TrustedHTMLPolicy>;
  }

  const cache = new WeakMap<object, TrustedHTMLPolicy>();

  Object.defineProperty(scope, TRUSTED_HTML_POLICY_CACHE_KEY, {
    value: cache,
  });

  return cache;
};

const createTrustedHTML = (policy: TrustedHTMLPolicy, html: string) => {
  const trustedHTML = policy.createHTML(html);

  if (trustedHTML == null) {
    throw new TypeError('Trusted Types policy rejected clipboard HTML.');
  }

  return trustedHTML;
};

const toTrustedHTML = (html: string) => {
  const factory = (
    globalThis as typeof globalThis & {
      trustedTypes?: TrustedTypePolicyFactory;
    }
  ).trustedTypes;

  if (!factory) return html;

  const defaultPolicy = factory.defaultPolicy;

  if (defaultPolicy) return createTrustedHTML(defaultPolicy, html);

  const policies = getTrustedHTMLPolicyCache();
  let policy = policies.get(factory);

  if (!policy) {
    policy = factory.createPolicy('plite-dom', {
      createHTML: (value) => value,
    });
    policies.set(factory, policy);
  }

  return createTrustedHTML(policy, html);
};

const restoreAppleConvertedSpaces = (document: Document) => {
  document.querySelectorAll('span.Apple-converted-space').forEach((span) => {
    if (span.childNodes.length !== 1 || span.textContent !== '\u00A0') return;

    span.replaceWith(document.createTextNode(' '));
  });
};

/**
 * Parse clipboard HTML through the application default Trusted Types policy,
 * or the `plite-dom` policy when no default exists.
 */
export const parseDOMClipboardHtml = (html: string) => {
  const trustedHTML = toTrustedHTML(html);

  const document = new DOMParser().parseFromString(
    // TypeScript's DOMParser declaration accepts only `string`, while the
    // browser sink also accepts the exact TrustedHTML returned by the policy.
    trustedHTML as string,
    'text/html'
  );

  restoreAppleConvertedSpaces(document);

  return document;
};
