---
"@udecode/plate-core": minor
---

Fix a critical issue when using multiple editors #1352
- `withHOC`: 3rd parameter can be used to add props to HOC.
- `usePlateId` now just gets plate id atom value and no longer gets event editor id as fallback.
- `useEventEditorId`: Get last event editor id: focus, blur or last.
- `useEventPlateId`: Get provider plate id or event editor id.
- `PlateEventProvider`: `PlateProvider` where id is the event editor id (used for toolbar buttons).
- `withPlateEventProvider`
