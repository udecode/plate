---
"@udecode/plate-image-ui": minor
---

changes:
- new deps:
  - `react-textarea-autosize` for image caption
  - `re-resizable` for resizing image width
- `ImageElement`
  - modified styles
  - wrapped the `img` html tag into a `figure`
  - render `Resizable` from `re-resizable`:
    - on resize stop, set the node width in `node.width`
    - hide left handle when image is aligned at left
    - hide right handle when image is aligned at right
  - caption:
    - `img.alt` is now the caption text
    - added an editable caption inside a `figcaption` html tag using `react-textarea-autosize`
    - the value is stored in `node.caption`
  - new props:
    - `resizableProps?: ResizableProps`
    - `align?: 'left' | 'center' | 'right'`
    - `draggable?: boolean`
    - `caption.disabled?: boolean`
    - `caption.align?: 'left' | 'center' | 'right'`
    - `caption.placeholder?: string`
- `ImageElementStyles` new customizable styles: `resizable`, `figure`, `figcaption`, `caption`, `handle`, `handleLeft`, `handleRight`
