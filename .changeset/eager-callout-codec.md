---
'@platejs/callout': patch
---

Define the callout Markdown codec on the callout plugin and derive its custom MDX tag from the resolved callout schema type. Decode the external Markdown paragraph wrapper without requiring a Plate paragraph plugin. Decode its phrasing children directly so a block-producing paragraph codec cannot be silently unwrapped into invalid callout content.
