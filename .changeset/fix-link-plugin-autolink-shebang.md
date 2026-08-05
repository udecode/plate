---
"@platejs/link": patch
---

Fix `LinkPlugin` autolinking plain text shebang lines starting with `#!` (e.g. `#!/bin/sh` or `#!/usr/bin/env node`). `validateUrl` now rejects shebang patterns so plain text shell scripts are not wrapped in anchor link nodes.
