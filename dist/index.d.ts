import {LRParser, NestMap} from "@lezer/lr"
import {Input, PartialParse, Parser} from "@lezer/common"

export const parser: LRParser

export function configureNesting(tags: readonly {
  tag: "script" | "style" | "textarea",
  attrs?: (attrs: {[attr: string]: string}) => boolean,
  parser: Parser
}[]): NestMap
