---
'@udecode/plate-comments': major
---
Breaking Change!

What? 

Removes the useCommentValue hook.

Why? 

The hook created a reference which was never updated and caused an error if users tried to edit comments.

How to migrate? 

The `useCommentValue` was only imported and called in a single plate-ui component, `comment-value.tsx`. The hook should be removed altogether. If you have not customized this component, you can reinstall the default component to import the changes. Otherwise you can manually delete to useCommentValue from your existing component. If you use the `useCommentValue` hook elsewhere in your project for any reason, you will need to replace it with your own implementation.