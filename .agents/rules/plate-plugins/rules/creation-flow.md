# Creation Flow

Choose semantic ownership before file topology. `VISION.md`'s Plugins &
Components and Slate Boundary sections set the ownership direction this flow
applies.

## Contents

- Decision tree
- Semantic owners
- File owners
- False ownership evidence
- File placement
- Layer check

```text
Need a plugin or plugin refactor?
|
+- Does the behavior matter without React?
|  |
|  +- yes -> `src/lib`
|  |   +- `createSlatePlugin`
|  |   +- real React job later? -> thin `toPlatePlugin` wrapper
|  |   +- no React job? -> keep base-only
|  |
|  +- no -> `src/react`
|      +- only groups complete plugins? -> app/registry kit array
|      +- genuinely hook/DOM/component-native? -> `createPlatePlugin`
|
+- For every proposed source file:
|  |
|  +- exactly one production owner?
|  |   +- yes -> inline in that plugin/component/test-family owner
|  |
|  +- React behavior passes through a package wrapper?
|  |   +- trace to terminal product consumers
|  |       +- all copied registry UI + UI/product policy -> registry family/kit
|  |       +- independent owners or durable headless subsystem -> package
|  |
|  +- multiple callers can reuse the plugin's `api` or `tf`?
|  |   +- yes -> keep implementation inline; callers use `editor.getApi(Plugin)`
|  |
|  +- real cross-plugin, cross-layer, standalone, or proof owner?
|      +- yes -> separate file with that owner
|      +- no  -> inline
|
+- Public call shape changes?
|  +- yes -> `best-api`
|
+- Missing generic substrate?
   +- Slate gap -> patch/plan the Slate owner
   +- Plate composition gap -> patch/plan Plate owner
```

## Semantic Owners

### Semantic base plugin

Use `createSlatePlugin` for document semantics, parsers, normalizers, injected
rules, transforms, and shared behavior contracts.

## File Owners

### Plugin owner

One plugin file may own:

- plugin declaration and real public contract types;
- options, selectors, and parser/serializer callbacks;
- `extendApi` and `extendTransforms` builders;
- transforms, normalizers, decorators, matchers, `handlers` and
  `overrideEditor` methods;
- plugin-only constants and implementation helpers.

File length is irrelevant. Extract only when another durable owner exists.

## False Ownership Evidence

None of these justify another source file:

- public export or direct import;
- documentation entry;
- old filename or barrel;
- tests;
- line count or readability preference;
- implementation kind such as query, transform, hook, or utility;
- multiple callers that can use the owning plugin's `api` or `tf`;
- hypothetical future reuse.

## File Placement

- Keep feature `src/react` roots flat unless a directory is a durable subsystem
  with several cross-family owners.
- Do not create `internal/` merely because code is private. Privacy is not
  ownership.
- Do not create taxonomy folders merely to shorten a large owner file.
- Delete obsolete helper files and regenerate barrels after colocation.

## Layer Check

Before writing code, answer:

1. Which behavior is generic Slate substrate?
2. Which behavior is Plate plugin/product composition?
3. Which one file owns each single-owner behavior?
4. Which proposed extraction has a real independent consumer graph?
5. Which public shape needs a `best-api` verdict?
