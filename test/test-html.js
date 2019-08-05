const {parser, configureHTML} = require("../dist/index")
const {parser: jsParser} = require("lezer-javascript")
const {fileTests} = require("lezer-generator/dist/test.js")

let fs = require("fs"), path = require("path")
let caseDir = __dirname

let mixed = configureHTML([{
  tag: "script",
  attrs(attrs) {
    return !attrs.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(attrs.type)
  },
  parser: jsParser
}])

for (let file of fs.readdirSync(caseDir)) {
  if (!/\.txt$/.test(file)) continue
  let name = /^[^\.]*/.exec(file)[0]
  describe(name, () => {
    let p = name == "mixed" ? mixed : parser
    for (let {name, run} of fileTests(fs.readFileSync(path.join(caseDir, file), "utf8"), file))
      it(name, () => run(p))
  })
}

