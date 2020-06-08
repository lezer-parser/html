## 0.9.0 (2020-06-08)

### Breaking changes

Upgrade to 0.9 parser serialization

### New features

Tag start/end tokens now have `NodeProp.openedBy`/`closedBy` props.

## 0.8.4 (2020-04-09)

### Bug fixes

Regenerate parser with a fix in lezer-generator so that the top node prop is properly assigned.

## 0.8.3 (2020-04-01)

### Bug fixes

Make the package load as an ES module on node

## 0.8.2 (2020-02-28)

### New features

Provide an ES module file.

## 0.8.1 (2020-02-26)

### Bug fixes

Adds support for single-quoted attribute values.

Don't treat /> tag ends as self-closing, just ignore them instead.

## 0.8.0 (2020-02-03)

### New features

Follow 0.8.0 release of the library.

## 0.7.0 (2020-01-20)

### Breaking changes

Use the lezer 0.7.0 parser format.

## 0.5.2 (2020-01-15)

### Bug fixes

Allow whitespace between the `<` and `/` in a close tag.

## 0.5.1 (2019-10-22)

### Bug fixes

Fix top prop missing from build output.

## 0.5.0 (2019-10-22)

### Breaking changes

Move from `lang` to `top` prop on document node.

## 0.4.0 (2019-09-10)

### Breaking changes

Adjust to 0.4.0 parse table format.

## 0.3.0 (2019-08-22)

### New features

First numbered release.
