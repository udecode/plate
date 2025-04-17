---
'@udecode/plate-yjs': major
---

Add multi-provider support for improved collaboration: now supports both Hocuspocus and WebRTC simultaneously using a shared Y.Doc. Improved sync state tracking with syncedProviderCount, better handling provider disconnections. Adds waitForAllProviders option to control rendering behavior. Introduces UnifiedProvider interface that enables custom provider implementations (e.g., IndexedDB for offline persistence).


