# lezer-html

This is an HTML grammar for the
[lezer](https://lezer.codemirror.net/) parser system.

The code is licensed under an MIT license.

## Interface

This package exports two bindings:

**`parser`**`: Parser`

The parser instance for the basic HTML grammar.

**`configureHTML`**`(tags: {`\
`  tag: string,`\
`  attrs?: (attrs: {[attr: string]: string}) => boolean,`\
`  parser?: Parser,`\
`  parseNode?: (input: InputStream, start: number) => Tree`\
`}[]): Parser`

Create a new parser instance which overrides the way the content of
some tags is parsed. Each override is an object with a `tag` property
holding the (lower case) tag name to override, and an optional `attrs`
predicate that, if given, has to return true for the tag's attributes
for this override to apply.

The `parser` or `parseNode` property describes the way the tag's
content is parsed. One or zero of these should be specified (zero
means don't parse, simply treat as plain text). See also
[`NestedGrammarSpec`](https://lezer.codemirror.net/docs/ref#lezer.NestedGrammarSpec)
in the lezer package.
