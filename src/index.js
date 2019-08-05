import {parser} from "./parser"

export {parser}

import {configureTags} from "./content"

export function configureHTML(tags) { return configureTags(parser, tags) }
