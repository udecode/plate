---
'@udecode/plate-media': minor
---

New `initialHeight` and `initialWidth` in `TImageElement` This will display a loading placeholder while the image is still loading, which helps maintain a consistent height.
Mew `placeholderId` Used to track what was converted from that placeholder plugin.
New `insertMedia` Used for inserting the placeholder at once.
New `validateFiles` utils for validate the files meet the `mediaConfig`. 
If validation fails,stop insert placeholder and save the error message in uploadErrorMessage.
NEw `option.multiple` `uploadMaxFileCount` Used to limit the number of placeholders inserted.