---
title: Slate React void renderers should not own hidden children
date: 2026-04-27
last_updated: 2026-04-27
category: docs/solutions/developer-experience
module: slate-v2 slate-react void and atom rendering
problem_type: developer_experience
component: tooling
symptoms:
  - Image and embed examples could regress when renderer code forgot the hidden spacer slot.
  - Public void renderer APIs made app renderers pass browser-critical children.
  - Fixing one example at a time left the same regression class open elsewhere.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, void, inline-void, spacer, shell, dx, browser-proof]
---

# Slate React void renderers should not own hidden children

## Problem

`VoidElement` exposed hidden spacer ownership to app renderers. That made every
image, embed, or custom void renderer responsible for DOM that exists for
selection and browser behavior, not visible UI.

Inline voids have the same trap with hidden anchor children. A mention renderer
should render `@R2-D2`, not decide where the zero-width child lives for Mac,
Android, Chromium, or selection repair.

## Symptoms

- Image and embed examples could show extra void spacer layout.
- Renderer code needed to remember `{children}` or a `spacer` prop even though
  app authors only wanted to render visible content.
- Mention renderers threaded `{children}` through platform-specific visible
  markup.
- A local example fix did not protect other void renderers from the same
  mistake.

## What Didn't Work

- Keeping a `spacer` override as the normal path. That made the bug opt-in to
  correctness.
- Asking every example to pass `{children}` manually. That duplicated hidden DOM
  responsibility across app code.
- Treating browser canaries as the only safety net. The API still allowed the
  broken shape.

## Solution

Move hidden spacer children into internal runtime context and make
`VoidElement` render visible content only:

```tsx
export const VoidSpacerChildrenContext = createContext<ReactNode>(null)
```

`EditableTextBlocks` provides the hidden children while rendering a void node:

```tsx
<VoidSpacerChildrenContext.Provider value={voidNode ? children : null}>
  <EditableRenderedElement {...props} />
</VoidSpacerChildrenContext.Provider>
```

`VoidElement` consumes that context and no longer accepts app-owned hidden
children:

```tsx
const spacerChildren = useContext(VoidSpacerChildrenContext)

return (
  <SlateElement isVoid style={{ position: 'relative', ...style }}>
    <Content contentEditable={false} style={contentStyle}>
      {content}
    </Content>
    <SlateSpacer style={spacerStyle}>{spacerChildren}</SlateSpacer>
  </SlateElement>
)
```

Example renderers then stay focused on visible UI:

```tsx
return <VoidElement content={<img alt="" src={element.url} />} />
```

Inline voids use a separate visible-content primitive:

```tsx
return (
  <InlineVoidElement
    content={`@${element.character}`}
    contentAs="div"
    data-cy={`mention-${element.character.replace(' ', '-')}`}
    style={style}
  />
)
```

The runtime chooses hidden child placement internally:

```tsx
const hiddenChildren = useContext(VoidHiddenChildrenContext)
const contentChildren = isApplePlatform() ? (
  <>
    {hiddenChildren}
    {content}
  </>
) : (
  <>
    {content}
    {hiddenChildren}
  </>
)
```

## Why This Works

Hidden spacer and hidden anchor children are part of the editor runtime
contract. They support selection mapping, zero-width text, and browser repair
behavior. App code should not be able to accidentally omit or move them while
rendering visible void content.

Internal context keeps the existing React flexibility for visible content while
making the browser-critical DOM non-optional. It also gives tests a clean
contract: ordinary `VoidElement` renderers do not pass hidden spacer children.

## Prevention

- Runtime-owned DOM should be impossible to forget in ordinary app renderers.
- If a renderer API asks app authors to pass hidden editor structure, the API is
  wrong unless it is explicitly an advanced escape hatch.
- Pair the API contract with browser canaries that assert layout, focus, DOM
  selection, model selection, and render counts for void routes.
- Keep block void and inline void primitives separate. They have different DOM
  shapes, but the same ownership rule: app renderers provide visible content,
  runtime provides hidden editor children.

## Related Issues

- [Void-like zero-width IME proofs need the real void spacer structure](../logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md)
- [Slate React selection export listeners must skip DOM-owned selection](../ui-bugs/2026-04-27-slate-react-selection-export-listeners-must-skip-dom-owned-selection.md)
