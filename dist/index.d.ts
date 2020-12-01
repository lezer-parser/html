import {Parser, NestedParser} from "lezer"
import {Input, ParseContext, PartialParse} from "lezer-tree"

export const parser: Parser

export function configureNesting(tags: {
  tag: string,
  attrs?: (attrs: {[attr: string]: string}) => boolean,
  parser: {startParse: (input: Input, startPos: number, context: ParseContext) => PartialParse}
}[]): {[name: string]: NestedParser}
