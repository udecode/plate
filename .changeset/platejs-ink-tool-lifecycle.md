---
'platejs': patch
---

- In `platejs/ink/react`, changing the Draw tool, hiding ink or turning the view read-only now ends the current pen or eraser contact at once, and a pen stroke that ends this way saves nothing more. Turning the view read-only turns the tool off, even when it turns back in the same batch. While ink is hidden, every press reaches the content. The pen and the eraser read the layer's position at each sample, so a removal that moves the layer leaves the next sample on the ink under the pointer. `setTool` returns false and keeps the current tool for a `size` that is not a finite number above 0, a brush `opacity` that is not a number above 0 and at most 1, or a brush `color` that is not a non-empty string.
