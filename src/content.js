import {ScriptText, StyleText, TextareaText, Element} from "./parser.terms.js"

const openTag = /^<\/?\s*([\.\-\:\w\xa1-\uffff]+)/

function attributes(tag) {
  let open = openTag.exec(tag), attrs = {}
  if (open) {
    let attr = /\s*([\.\-\:\w\xa1-\uffff]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s=<>"'/]+)))?/g, m
    attr.lastIndex = open.index + open[0].length
    while (m = attr.exec(tag)) attrs[m[1]] = m[4] || m[3] || m[2] || m[1]
  }
  return attrs
}

function skip(name) { return token => tagName(token) == name }

// tags: {
//   tag: "script" | "style" | "textarea",
//   attrs?: ({[attr: string]: string}) => boolean,
//   parser: Parser
// }[]

const tagTypes = {
  script: ScriptText,
  style: StyleText,
  textarea: TextareaText
}

const elementType = [Element]

function nestedFor(tags) {
  return (input, stack, from) => {
    let openTag = input.read(stack.startOf(elementType), from), matches, attrs
    for (let match of tags) if (!match.attrs || match.attrs(attrs || (attrs = attributes(openTag))))
      return match.parser
    return null
  }
}

export function configureNesting(tags) {
  let tagMap = Object.create(null)
  for (let tag of tags) {
    if (!tagTypes.hasOwnProperty(tag.tag))
      throw new RangeError("Only script, style, and textarea tags can host nested parsers")
    let id = tagTypes[tag.tag]
    ;(tagMap[id] || (tagMap[id] = [])).push(tag)
  }
  let result = Object.create(null)
  for (let id in tagMap) result[id] = nestedFor(tagMap[id])
  return result
}
