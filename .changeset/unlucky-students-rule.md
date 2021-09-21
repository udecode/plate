---
'@udecode/plate-toolbar': major
---

added usePopupPosition hook to position the hovering popup correctly even in the nested scroll, this hook using react-popper internally and user can pass modifiers, placements to customise the behaviour. Added transition for showing the balloon toolbar smoothly. Removed the hiddenDelay prop from BalloonToolbar component. Added scrollContainer prop to the BalloonToolbar as well. Updated the docs to show an example how to customize the usePopupPosition.
