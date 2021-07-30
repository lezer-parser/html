import {LRParser} from "@lezer/lr"
import {Input, PartialParse, Parser, TreeCursor} from "@lezer/common"
import {NestedParse} from "@lezer/mix"

export const parser: LRParser

export function configureNesting(tags: readonly {
  tag: "script" | "style" | "textarea",
  attrs?: (attrs: {[attr: string]: string}) => boolean,
  parser: Parser
}[]): (node: TreeCursor, input: Input) => NestedParse | null
