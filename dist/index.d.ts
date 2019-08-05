import {Parser, InputStream, Tree} from "lezer"

export const parser: Parser

export function configureHTML(tags: {
  tag: string,
  attrs?: (attrs: {[attr: string]: string}) => boolean,
  parser?: Parser,
  parseNode?: (input: InputStream, start: number) => Tree
}[]): Parser
