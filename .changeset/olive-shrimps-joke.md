---
'@udecode/plate-core': patch
---

Mitigate XSS in `element.attributes` by requiring all attribute names to be allowlisted in the `node.dangerouslyAllowAttributes` plugin configuration option.

Migration:

For each plugin that needs to support passing DOM attributes using `element.attributes`, add the list of allowed attributes to the `node.dangerouslyAllowAttributes` option of the plugin.

```ts
const ImagePlugin = createPlatePlugin({
  key: 'image',
  node: {
    isElement: true,
    isVoid: true,
    dangerouslyAllowAttributes: ['alt'],
  },
});
```

To modify existing plugins, use the `extend` method as follows:

```ts
const MyImagePlugin = ImagePlugin.extend({
  node: {
    dangerouslyAllowAttributes: ['alt'],
  },
});
```

WARNING: Improper use of `dangerouslyAllowAttributes` WILL make your application vulnerable to cross-site scripting (XSS) or information exposure attacks. Ensure you carefully research the security implications of any attribute before adding it. For example, the `src` and `href` attributes will allow attackers to execute arbitrary code, and the `style` and `background` attributes will allow attackers to leak users' IP addresses.
