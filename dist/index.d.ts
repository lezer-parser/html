import {Parser, Input, Tree, IncrementalParser} from "lezer"
import {TreeFragment} from "lezer-tree"

export const parser: Parser

export function configureHTML(tags: {
  tag: string,
  attrs?: (attrs: {[attr: string]: string}) => boolean,
  parser?: Parser | ((input: Input, pos: number, fragments?: readonly TreeFragment[]) => IncrementalParser),
  parseNode?: (input: Input, start: number) => Tree
}[]): Parser
