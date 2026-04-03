---
"@platejs/date": major
---

Keep date mentions keyboard-accessible by letting left and right arrow movement enter the inline void child instead of skipping across the node as one atomic step.

**Migration:** If you relied on character movement skipping over date nodes in one step, expect the caret to enter the date node during left and right arrow movement.
