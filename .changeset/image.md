---
'@udecode/plate-image': minor
'@udecode/plate-ui-image': minor
---

We're extracting unstyled components from the existing components in ui packages, following the composition principle, props hooks and state hooks. The goal is to improve reusability. We're starting the process with the image element. 

### @udecode/plate-image

```tsx
export const Image = {
  Root: ImageRoot,
  Caption: ImageCaption,
  Img: ImageImg,
  Resizable: ImageResizable,
  CaptionTextarea: ImageCaptionTextarea,
};
```
- each of the above components has a "props hook" (pattern: `useImage`, `useImageCaption`, etc.) so you could use these in your own component.
- `useImageStore`: atom with `width`
- `useImageElement`
- move these deps from `plate-ui-image` to `plate-image`:
  - `"react-textarea-autosize": "^8.3.3"`
  - `"re-resizable": "^6.9.9"`

### @udecode/plate-ui-image

- `ImageElement` is only a composition of the above components with styling. The goal is to allow you to replace it with your own styles / composition.