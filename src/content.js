function tagName(tag) {
  let m = /^<\/?\s*([\.\-\:\w\xa1-\uffff]+)/.exec(tag)
  return m ? m[1].toLowerCase() : null
}

const stay = {stay: true}

function skip(name) {
  return {
    filterEnd(token) { return tagName(token) == name }
  }
}

export function elementContent(input, stack) {
  let name = tagName(input.read(stack.ruleStart, stack.pos))
  if (!name) return stay
  if (name == "script" || name == "textarea" || name == "style") return skip(name)
  return stay
}
