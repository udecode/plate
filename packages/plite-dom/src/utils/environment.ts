type DOMRootEngine = 'blink' | 'gecko' | 'unknown' | 'webkit';
type DOMRootPlatform = 'android' | 'apple' | 'other';

export type DOMRootQuirk =
  | 'android-beforeinput-delete-is-uncancelable'
  | 'compositionend-precedes-final-input'
  | 'shadow-selection-needs-composed-range'
  | 'webkit-contextmenu-focus';

export type ResolvedDOMRootFacts = Readonly<{
  beforeInput: boolean;
  engine: DOMRootEngine;
  language: string;
  platform: DOMRootPlatform;
  quirks: ReadonlySet<DOMRootQuirk>;
}>;

export type DOMRootFactOverrides = Partial<ResolvedDOMRootFacts>;

const APPLE_PLATFORM_RE = /Mac|iPad|iPhone|iPod/;
const APPLE_USER_AGENT_RE = /Mac OS X/;
const ANDROID_USER_AGENT_RE = /\bAndroid\b/i;
const BLINK_USER_AGENT_RE =
  /\b(?:Chrome|Chromium|CriOS|Edg|EdgA|EdgiOS|OPR|UCBrowser)\//i;
const FIREFOX_USER_AGENT_RE = /\bFirefox\//i;
const IOS_USER_AGENT_RE = /\b(?:iPad|iPhone|iPod)\b/i;
const WECHAT_USER_AGENT_RE = /\bWechat\b/i;
const MAC_WECHAT_USER_AGENT_RE = /\bMacWechat\b/i;
const NON_BROWSER_DOM_USER_AGENT_RE = /\bjsdom\//i;
const UC_USER_AGENT_RE = /\bUCBrowser\b/i;
const WEBKIT_USER_AGENT_RE = /\bAppleWebKit\//i;

const DOM_ROOT_FACTS_BY_REALM = new WeakMap<object, ResolvedDOMRootFacts>();

const createReadonlySet = <T>(values: Iterable<T>): ReadonlySet<T> => {
  const set = new Set(values);
  const readonlySet = new Proxy(set, {
    get(target, property) {
      if (property === 'add' || property === 'clear' || property === 'delete') {
        return () => {
          throw new TypeError('DOM root facts are immutable.');
        };
      }

      const value = Reflect.get(target, property, target) as unknown;

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return Object.freeze(readonlySet);
};

const freezeDOMRootFacts = ({
  beforeInput,
  engine,
  language,
  platform,
  quirks,
}: ResolvedDOMRootFacts): ResolvedDOMRootFacts =>
  Object.freeze({
    beforeInput,
    engine,
    language,
    platform,
    quirks: createReadonlySet(quirks),
  });

const getRootDocument = (root: Document | ShadowRoot) =>
  root.nodeType === 9 ? (root as Document) : (root as ShadowRoot).ownerDocument;

const resolveRealmDOMRootFacts = (
  root: Document | ShadowRoot
): ResolvedDOMRootFacts => {
  const document = getRootDocument(root);
  const realm = document.defaultView;
  const cached = realm && DOM_ROOT_FACTS_BY_REALM.get(realm);

  if (cached) return cached;

  // All browser identity reads live here. Callers resolve through a mounted
  // root or event instead of consulting the process-global realm.
  const hostNavigator = realm?.navigator;
  const platformName = hostNavigator?.platform ?? '';
  const userAgent = hostNavigator?.userAgent ?? '';
  const isAndroid = ANDROID_USER_AGENT_RE.test(userAgent);
  const isMobileApple =
    IOS_USER_AGENT_RE.test(userAgent) ||
    (platformName === 'MacIntel' && (hostNavigator?.maxTouchPoints ?? 0) > 1);
  const platform: DOMRootPlatform = isAndroid
    ? 'android'
    : APPLE_PLATFORM_RE.test(platformName) ||
        APPLE_USER_AGENT_RE.test(userAgent)
      ? 'apple'
      : 'other';
  const engine: DOMRootEngine = NON_BROWSER_DOM_USER_AGENT_RE.test(userAgent)
    ? 'unknown'
    : FIREFOX_USER_AGENT_RE.test(userAgent)
      ? 'gecko'
      : WEBKIT_USER_AGENT_RE.test(userAgent)
        ? BLINK_USER_AGENT_RE.test(userAgent)
          ? 'blink'
          : 'webkit'
        : BLINK_USER_AGENT_RE.test(userAgent)
          ? 'blink'
          : 'unknown';
  const InputEventConstructor = realm?.InputEvent;
  const beforeInput =
    !!InputEventConstructor &&
    typeof (
      InputEventConstructor.prototype as InputEvent & {
        getTargetRanges?: unknown;
      }
    ).getTargetRanges === 'function';
  const quirks = new Set<DOMRootQuirk>();

  if (isAndroid) {
    quirks.add('android-beforeinput-delete-is-uncancelable');
  }
  if (
    isMobileApple ||
    UC_USER_AGENT_RE.test(userAgent) ||
    (WECHAT_USER_AGENT_RE.test(userAgent) &&
      !MAC_WECHAT_USER_AGENT_RE.test(userAgent))
  ) {
    quirks.add('compositionend-precedes-final-input');
  }
  if (engine === 'webkit') {
    quirks.add('shadow-selection-needs-composed-range');
    quirks.add('webkit-contextmenu-focus');
  }

  const facts = freezeDOMRootFacts({
    beforeInput,
    engine,
    language: hostNavigator?.language ?? '',
    platform,
    quirks,
  });

  if (realm) {
    DOM_ROOT_FACTS_BY_REALM.set(realm, facts);
  }

  return facts;
};

export const resolveDOMRootFacts = (
  root: Document | ShadowRoot,
  testOverrides?: DOMRootFactOverrides
): ResolvedDOMRootFacts => {
  const facts = resolveRealmDOMRootFacts(root);

  if (!testOverrides) return facts;

  return freezeDOMRootFacts({
    beforeInput: testOverrides.beforeInput ?? facts.beforeInput,
    engine: testOverrides.engine ?? facts.engine,
    language: testOverrides.language ?? facts.language,
    platform: testOverrides.platform ?? facts.platform,
    quirks: testOverrides.quirks ?? facts.quirks,
  });
};

const getEventTarget = (event: unknown): unknown => {
  if (!event || typeof event !== 'object') return null;

  const candidate = event as {
    currentTarget?: unknown;
    nativeEvent?: unknown;
    target?: unknown;
    view?: unknown;
  };

  return (
    candidate.currentTarget ??
    candidate.target ??
    (candidate.nativeEvent && candidate.nativeEvent !== event
      ? getEventTarget(candidate.nativeEvent)
      : null) ??
    candidate.view
  );
};

const getDOMRoot = (source: unknown): Document | ShadowRoot | null => {
  if (!source || typeof source !== 'object') return null;

  const candidate = source as {
    document?: Document;
    getRootNode?: () => Node;
    nodeType?: number;
    ownerDocument?: Document;
  };

  if (candidate.nodeType === 9) return source as Document;
  if (
    candidate.nodeType === 11 &&
    'host' in (source as Record<PropertyKey, unknown>)
  ) {
    return source as ShadowRoot;
  }
  if (typeof candidate.getRootNode === 'function') {
    const root = candidate.getRootNode();

    if (
      root?.nodeType === 9 ||
      (root?.nodeType === 11 &&
        'host' in (root as unknown as Record<PropertyKey, unknown>))
    ) {
      return root as Document | ShadowRoot;
    }
  }
  if (candidate.ownerDocument) return candidate.ownerDocument;
  if (candidate.document?.nodeType === 9) return candidate.document;

  return null;
};

const resolveDOMSourceFacts = (source: unknown) => {
  const root = getDOMRoot(source) ?? getDOMRoot(getEventTarget(source));

  return root ? resolveDOMRootFacts(root) : null;
};

/**
 * Resolve Apple modifier semantics from the event's own realm.
 *
 * @internal
 */
export const usesAppleDOMHotkeys = (event: unknown) =>
  resolveDOMSourceFacts(event)?.platform === 'apple';

/** @internal */
export const isAndroidDOMHost = (source: unknown) =>
  resolveDOMSourceFacts(source)?.platform === 'android';

/** @internal */
export const isBlinkDOMHost = (source: unknown) =>
  resolveDOMSourceFacts(source)?.engine === 'blink';

/** @internal */
export const isGeckoDOMHost = (source: unknown) =>
  resolveDOMSourceFacts(source)?.engine === 'gecko';

/** @internal */
export const isWebKitDOMHost = (source: unknown) =>
  resolveDOMSourceFacts(source)?.engine === 'webkit';

/** @internal */
export const supportsDOMBeforeInput = (source: unknown) =>
  resolveDOMSourceFacts(source)?.beforeInput ?? false;

/** @internal */
export const getDOMHostLanguage = (source: unknown) =>
  resolveDOMSourceFacts(source)?.language ?? '';

/** @internal */
export const hasDOMHostQuirk = (source: unknown, quirk: DOMRootQuirk) =>
  resolveDOMSourceFacts(source)?.quirks.has(quirk) ?? false;

// Check if DOM is available as React does internally.
// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
/** True when the current environment exposes the browser DOM APIs Plite needs. */
export const CAN_USE_DOM = !!(
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
);
