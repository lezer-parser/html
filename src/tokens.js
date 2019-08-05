/* Hand-written tokenizers for HTML. */

import {ExternalTokenizer} from "lezer"
import {matchingTagName, nonMatchingTagName, element, selfClosingEndTag, openingTag, selfClosingTag} from "./parser.terms.js"

const selfClosers = {
  area: true, base: true, br: true, col: true, command: true,
  embed: true, frame: true, hr: true, img: true, input: true,
  keygen: true, link: true, meta: true, param: true, source: true,
  track: true, wbr: true, menuitem: true
}

const implicitlyClosed = {
  dd: true, li: true, optgroup: true, option: true, p: true,
  rp: true, rt: true, tbody: true, td: true, tfoot: true,
  th: true, tr: true
}

const closeOnOpen = {
  dd: {dd: true, dt: true},
  dt: {dd: true, dt: true},
  li: {li: true},
  option: {option: true, optgroup: true},
  optgroup: {optgroup: true},
  p: {address: true, article: true, aside: true, blockquote: true, dir: true,
      div: true, dl: true, fieldset: true, footer: true, form: true,
      h1: true, h2: true, h3: true, h4: true, h5: true, h6: true,
      header: true, hgroup: true, hr: true, menu: true, nav: true, ol: true,
      p: true, pre: true, section: true, table: true, ul: true},
  rp: {rp: true, rt: true},
  rt: {rp: true, rt: true},
  tbody: {tbody: true, tfoot: true},
  td: {td: true, th: true},
  tfoot: {tbody: true},
  th: {td: true, th: true},
  thead: {tbody: true, tfoot: true},
  tr: {tr: true}
}

function nameChar(ch) {
  return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161
}

const tagStart = /^<\s*([\.\-\:\w\xa1-\uffff]+)/

export const closeTagName = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start
  for (;;) {
    let next = input.get(pos)
    if (!nameChar(next)) break
    pos++
  }
  if (pos > token.start) {
    let name = input.read(token.start, pos)
    let elementStart = stack.startOf([element])
    let match = elementStart < 0 ? null : tagStart.exec(input.read(elementStart, elementStart + name.length + 10))
    token.accept(match && match[1].toLowerCase() == name.toLowerCase() ? matchingTagName : nonMatchingTagName, pos)
  }
}, {contextual: true})

const lessThan = 60, greaterThan = 62

export const selfClosed = new ExternalTokenizer((input, token, stack) => {
  if (input.get(token.start) != greaterThan) return
  let from = stack.startOf([openingTag, selfClosingTag])
  let match = from < 0 ? null : tagStart.exec(input.read(from, token.start))
  if (match && selfClosers[match[1].toLowerCase()]) token.accept(selfClosingEndTag, token.start + 1)
}, {contextual: true})
