/* Hand-written tokenizers for HTML. */

import {ExternalTokenizer} from "lezer"
import {StartTag, StartCloseTag, MismatchedStartCloseTag, missingCloseTag,
        SelfCloseEndTag,
        Element, OpenTag, SelfClosingTag} from "./parser.terms.js"

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
  p: {
    address: true, article: true, aside: true, blockquote: true, dir: true,
    div: true, dl: true, fieldset: true, footer: true, form: true,
    h1: true, h2: true, h3: true, h4: true, h5: true, h6: true,
    header: true, hgroup: true, hr: true, menu: true, nav: true, ol: true,
    p: true, pre: true, section: true, table: true, ul: true
  },
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

function isSpace(ch) {
  return ch == 9 || ch == 10 || ch == 13 || ch == 32
}

const lessThan = 60, greaterThan = 62, slash = 47, question = 63, bang = 33

const tagStartExpr = /^<\s*([\.\-\:\w\xa1-\uffff]+)/

const elementQuery = [Element]

export const tagStart = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, first = input.get(pos)
  // End of file, just close anything
  if (first < 0) {
    let contextStart = stack.startOf(elementQuery)
    let match = contextStart < 0 ? null : tagStartExpr.exec(input.read(contextStart, contextStart + 30))
    if (match && implicitlyClosed[match[1].toLowerCase()]) token.accept(missingCloseTag, token.start)
  }
  if (first != lessThan) return
  pos++
  let close = false, tokEnd = pos
  for (let next; next = input.get(pos);) {
    if (next == slash && !close) { close = true; pos++; tokEnd = pos }
    else if (next == question || next == bang) return
    else if (isSpace(next)) pos++
    else break
  }
  let nameStart = pos
  while (nameChar(input.get(pos))) pos++
  if (pos > nameStart) {
    let name = input.read(nameStart, pos).toLowerCase()
    let contextStart = stack.startOf(elementQuery)
    let match = contextStart < 0 ? null : tagStartExpr.exec(input.read(contextStart, contextStart + name.length + 10))
    if (match) {
      let contextName = match[1].toLowerCase()
      if (close && name != contextName)
        return implicitlyClosed[contextName] ? token.accept(missingCloseTag, token.start)
          : token.accept(MismatchedStartCloseTag, tokEnd)
      if (!close && closeOnOpen[contextName] && closeOnOpen[contextName][name])
        return token.accept(missingCloseTag, token.start)
    }
  }
  token.accept(close ? StartCloseTag : StartTag, tokEnd)
}, {contextual: true})

const tagQuery = [OpenTag, SelfClosingTag]

export const selfClosed = new ExternalTokenizer((input, token, stack) => {
  let next = input.get(token.start), end = token.start + 1
  if (next == slash) {
    if (input.get(end) != greaterThan) return
    end++
  } else if (next != greaterThan) {
    return
  }
  let from = stack.startOf(tagQuery)
  let match = from < 0 ? null : tagStartExpr.exec(input.read(from, token.start))
  if (match && selfClosers[match[1].toLowerCase()]) token.accept(SelfCloseEndTag, end)
}, {contextual: true})
