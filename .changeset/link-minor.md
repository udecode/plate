---
'@udecode/plate-link': minor
---

- new dep:
  - `@udecode/plate-button`
- new unstyled components + props hooks:
  - `LinkRoot`
  - `FloatingLink`
  - `FloatingLinkEditRoot`
  - `FloatingLinkInsertRoot`
  - `FloatingLinkUrlInput`
  - `FloatingLinkTextInput`
  - `FloatingLinkEditButton`
  - `UnlinkButton`
  - `OpenLinkButton`
- new store: `floatingLinkStore`
- `LinkPlugin` new props:
  - `triggerFloatingLinkHotkeys`: Hotkeys to trigger floating link. Default is 'command+k, ctrl+k'