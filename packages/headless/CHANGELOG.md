# @udecode/plate-headless

## 20.4.1

## 20.4.0

## 20.3.2

## 20.3.1

## 20.3.0

## 20.2.0

## 20.1.0

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.5

## 19.4.4

## 19.4.3

## 19.4.2

## 19.4.1

## 19.4.0

## 19.3.0

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.7

## 19.0.6

## 19.0.5

## 19.0.3

## 19.0.2

## 19.0.1

## 19.0.0

## 18.15.0

## 18.14.4

## 18.14.3

## 18.14.2

## 18.14.0

## 18.13.2

## 18.13.1

## 18.13.0

### Minor Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - new plugin: comments

## 18.12.2

## 18.11.2

## 18.11.1

### Patch Changes

- [#2016](https://github.com/udecode/plate/pull/2016) by [@bojangles-m](https://github.com/bojangles-m) – chore: added emoji package

## 18.11.0

### Minor Changes

- [#2007](https://github.com/udecode/plate/pull/2007) by [@bojangles-m](https://github.com/bojangles-m) – New plugin: emoji

## 18.10.3

## 18.10.1

## 18.9.2

## 18.9.1

## 18.9.0

## 18.8.1

## 18.7.0

## 18.6.0

## 18.5.1

## 18.5.0

## 18.3.1

## 18.3.0

## 18.2.1

## 18.2.0

## 18.1.3

## 18.1.2

## 18.1.1

## 18.1.0

## 18.0.0

### Major Changes

- [#1889](https://github.com/udecode/plate/pull/1889) by [@zbeyens](https://github.com/zbeyens) –
  - `@udecode/plate-selection` package moved out from `@udecode/plate` because of https://github.com/Simonwep/selection/issues/124
  - Migration:
    - If not using `createBlockSelectionPlugin`, no migration is needed.
    - Otherwise, install `@udecode/plate-selection` and import `createBlockSelectionPlugin` from that package.

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.9.1

## 16.9.0

## 16.8.1

## 16.8.0

### Minor Changes

- [#1856](https://github.com/udecode/plate/pull/1856) by [@zbeyens](https://github.com/zbeyens) – New package: `@udecode/plate-selection`

## 16.7.0

## 16.6.1

## 16.6.0

## 16.5.0

## 16.4.2

## 16.4.1

## 16.3.0

## 16.2.3

## 16.2.2

## 16.2.1

## 16.2.0

## 16.1.1

## 16.1.0

## 16.0.2

## 16.0.1

## 16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - deprecate `@udecode/plate-image` and `@udecode/plate-media-embed`, those got merged into `@udecode/plate-media`

## 15.0.6

## 15.0.5

## 15.0.3

## 15.0.1

## 15.0.0

### Minor Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - new deps + re-exports:
    - `@udecode/plate-button`
    - `@udecode/plate-floating`

## 14.4.3

## 14.4.2

## 14.4.1

## 14.4.0

## 14.3.0

## 14.2.0

## 14.1.0

## 14.0.2

## 14.0.1

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.4.2

## 13.4.1

## 13.4.0

## 13.3.2

## 13.3.1

## 13.3.0

## 13.2.1

## 13.1.0

## 13.0.1

### Patch Changes

- [#1588](https://github.com/udecode/plate/pull/1588) by [@zbeyens](https://github.com/zbeyens) – remove @udecode/plate-juice from exports

## 13.0.0

### Major Changes

- [#1585](https://github.com/udecode/plate/pull/1585) by [@zbeyens](https://github.com/zbeyens) – Removed `@udecode/plate-juice` from `@udecode/plate`. Install it if using `@udecode/plate-serializer-docx`:
  ```bash
  yarn install @udecode/plate-juice
  ```

## 11.3.1

## 11.3.0

## 11.2.1

## 11.2.0

## 11.1.1

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

## 10.7.0

## 10.6.3

## 10.6.1

## 10.6.0

## 10.5.3

## 10.5.2

## 10.5.1

## 10.5.0

## 10.4.5

## 10.4.2

## 10.4.1

## 10.4.0

## 10.3.0

## 10.2.4

## 10.2.3

## 10.2.2

## 10.2.1

## 10.2.0

## 10.1.3

### Patch Changes

- [#1398](https://github.com/udecode/plate/pull/1398) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Add @udecode/plate-combobox to @udecode/plate-headless dependencies.

  Plate combobox was getting compiled into the dist files, as opposed to being just re-exported, leading to two conflicting versions of @udecode/plate-combobox: one being the package itself, the other being the inlined version in @udecode/plate-headless.

  Fixes: #1339

## 10.1.2

## 10.1.1

## 10.1.0

## 10.0.0

## 9.4.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

## 9.1.3

## 9.1.1

## 9.1.0

## 9.0.0
