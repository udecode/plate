---
'platejs': major
---

Validate stored URLs by what they do. The schema enforces each role's floor at every admission, including `initialValue`, updates, paste and HTML, Markdown and DOCX import.

- Link `url` and the `sourceUrl` of videos and embeds must be safe to open: `javascript:`, `vbscript:`, `data:`, `blob:` and `filesystem:` URLs are always rejected, and `LinkPlugin`'s `allowedSchemes` (default `http`, `https`, `mailto` and `tel`) narrows or widens the schemes above that floor for insertion, import and rendering
- Image `url` accepts web and `blob:` URLs and base64 `data:` URLs of raster images; audio, video and file `url` accept web and `blob:` URLs; embed `url` accepts only absolute `http` and `https` URLs
- Relative URLs stay valid except for embeds, and an empty URL is an unresolved placeholder; a URL with control characters, a backslash or a leading `//` is rejected
- Media insertion refuses a URL its role does not accept
- Remove `sanitizeUrl` and the link option `dangerouslySkipSanitization`

**Migration:** Replace `dangerouslySkipSanitization: true` with the schemes your links need:

```tsx
LinkPlugin.configure({
  initialState: { allowedSchemes: ['http', 'https', 'mailto', 'tel', 'notes'] },
});
```
