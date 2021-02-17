/* Hand-written tokenizers for HTML. */

import {ExternalTokenizer, ContextTracker} from "lezer"
import {StartTag, StartCloseTag, MismatchedStartCloseTag, missingCloseTag,
        SelfCloseEndTag, IncompleteCloseTag, Element, OpenTag,
        Dialect_noMatch, commentContent as cmntContent} from "./parser.terms.js"

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

let cachedName = null, cachedInput = null, cachedPos = 0
function tagNameAfter(input, pos) {
  if (cachedPos == pos && cachedInput == input) return cachedName
  let next = input.get(pos)
  while (isSpace(next)) next = input.get(++pos)
  let start = pos
  while (nameChar(next)) next = input.get(++pos)
  // Undefined to signal there's a <? or <!, null for just missing
  cachedInput = input; cachedPos = pos
  return cachedName = pos > start ? input.read(start, pos).toLowerCase() : next == question || next == bang ? undefined : null
}

const lessThan = 60, greaterThan = 62, slash = 47, question = 63, bang = 33

function ElementContext(name, parent) {
  this.name = name
  this.parent = parent
  this.hash = parent ? parent.hash : 0
  for (let i = 0; i < name.length; i++) this.hash += (this.hash << 4) + name.charCodeAt(i) + (name.charCodeAt(i) << 8)
}

export const elementContext = new ContextTracker({
  start: null,
  shift(context, term, input, stack) {
    return term == StartTag ? new ElementContext(tagNameAfter(input, stack.pos) || "", context) : context
  },
  reduce(context, term) {
    return term == Element && context ? context.parent : context
  },
  reuse(context, node, input, stack) {
    let type = node.type.id
    return type == StartTag || type == OpenTag
      ? new ElementContext(tagNameAfter(input, stack.pos - node.length + 1) || "", context) : context
  },
  hash(context) { return context ? context.hash : 0 },
  strict: false
})

export const tagStart = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, first = input.get(pos), close
  // End of file, close any open tags
  if (first < 0 && stack.context) token.accept(missingCloseTag, token.start)
  if (first != lessThan) return
  pos++
  if (close = (input.get(pos) == slash)) pos++
  let name = tagNameAfter(input, pos)
  if (name === undefined) return
  if (!name) return token.accept(close ? IncompleteCloseTag : StartTag, pos)

  let parent = stack.context ? stack.context.name : null
  if (close) {
    if (name == parent) return token.accept(StartCloseTag, pos)
    if (parent && implicitlyClosed[parent]) return token.accept(missingCloseTag, token.start)
    if (stack.dialectEnabled(Dialect_noMatch)) return token.accept(StartCloseTag, pos)
    for (let cx = stack.context; cx; cx = cx.parent) if (cx.name == name) return
    token.accept(MismatchedStartCloseTag, pos)
  } else {
    if (parent && closeOnOpen[parent] && closeOnOpen[parent][name]) token.accept(missingCloseTag, token.start)
    else token.accept(StartTag, pos)
  }
})

export const selfClosed = new ExternalTokenizer((input, token, stack) => {
  let next = input.get(token.start), end = token.start + 1
  if (next == slash) {
    if (input.get(end) != greaterThan) return
    end++
  } else if (next != greaterThan) {
    return
  }
  if (stack.context && selfClosers[stack.context.name]) token.accept(SelfCloseEndTag, end)
})

export const commentContent = new ExternalTokenizer((input, token) => {
  let pos = token.start, endPos = 0
  for (;;) {
    let next = input.get(pos)
    if (next < 0) break
    pos++
    if (next == "-->".charCodeAt(endPos)) {
      endPos++
      if (endPos == 3) { pos -= 3; break }
    } else {
      endPos = 0
    }
  }
  if (pos > token.start) token.accept(cmntContent, pos)
})
