# Component Shape and Editor Access

`VISION.md` owns the plugin and component direction. This reference records
the published contracts that copied registry code consumes.

Plate owns framework-defined plugin fields. Registry code consumes those
contracts instead of restating them.

| Plugin field | Consumer contract |
| --- | --- |
| live `node.component` | `PlateElementProps<TElement>` or `PlateLeafProps<TText>` from `platejs/react` |
| static `node.component` | `SlateElementProps<TElement>` or `SlateLeafProps<TText>` from `platejs/static` |
| live `render.beforeEditable` / `afterEditable` / `beforeContainer` / `afterContainer` | `EditableSiblingComponent` |
| live `render.aboveNodes` / `belowNodes` | `RenderNodeWrapper`, `RenderNodeWrapperProps`, `RenderNodeWrapperFunction` |
| static `render.aboveNodes` / `belowNodes` | `RenderStaticNodeWrapper`, `RenderStaticNodeWrapperProps`, `RenderStaticNodeWrapperFunction` |

```tsx
import {
  type PlateElementProps,
  PlateElement,
  createPlatePlugin,
} from 'platejs/react';

function FeatureElement(props: PlateElementProps) {
  return <PlateElement {...props} />;
}

const FeaturePlugin = createPlatePlugin({
  key: 'feature',
  node: {
    component: FeatureElement,
    isElement: true,
  },
});
```

Forward full renderer props. Let `configure` and `extend` callbacks infer their
editor context. Repair weak package typing instead of rebuilding framework
fields in copied UI.
