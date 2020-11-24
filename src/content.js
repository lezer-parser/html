import {RawText} from "./parser.terms.js"

const openTag = /^<\/?\s*([\.\-\:\w\xa1-\uffff]+)/

function tagName(tag) {
  let m = openTag.exec(tag)
  return m ? m[1].toLowerCase() : null
}

function attributes(tag) {
  let open = openTag.exec(tag), attrs = {}
  if (open) {
    let attr = /\s*([\.\-\:\w\xa1-\uffff]+)\s*(?:=("[^"]*"|'[^']*'|[^\s=<>"'/]+))?/g, m
    attr.lastIndex = open.index + open[0].length
    while (m = attr.exec(tag)) attrs[m[1]] = m[2] || m[1]
  }
  return attrs
}

function skip(name) { return token => tagName(token) == name }

// tags: {
//   tag: string,
//   attrs?: ({[attr: string]: string}) => boolean,
//   parser: Parser | (input: Input, pos: number, fragments?: readonly TreeFragment[]) => IncrementalParser,
// }[]

function resolveContent(tags) {
  let tagMap = null
  for (let tag of tags) {
    if (!tagMap) tagMap = Object.create(null)
    ;(tagMap[tag.tag] || (tagMap[tag.tag] = [])).push({
      attrs: tag.attrs,
      value: {
        filterEnd: skip(tag.tag),
        parser: typeof tag.parser == "function" ? tag.parser : (input, startPos, fragments) => {
          return tag.parser.startParse(input, {startPos, fragments})
        }
      }
    })
  }
  return function(input, stack) {
    let openTag = input.read(stack.ruleStart, stack.pos)
    let name = tagName(openTag), matches, attrs
    if (!name) return null
    if (tagMap && (matches = tagMap[name])) {
      for (let match of matches) {
        if (!match.attrs || match.attrs(attrs || (attrs = attributes(openTag)))) return match.value
      }
    }
    if (name == "script" || name == "textarea" || name == "style") return {
      filterEnd: skip(name),
      wrapType: RawText
    }
    return null
  }
}

export const elementContent = resolveContent([])

export function configureTags(parser, tags) {
  return parser.configure({nested: {elementContent: resolveContent(tags)}})
}
