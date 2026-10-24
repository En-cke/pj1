import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import type { SvgParser } from "./SvgParser.js";

export class FileService {
  constructor(private readonly parser:SvgParser){}

  async read(path:string):Promise<{document:SvgDocument;warnings:string[]}>{
    const fullPath=resolve(path);
    try{const xml=await readFile(fullPath,"utf8");return this.parser.parse(xml,fullPath);}catch(error){if(error instanceof EditorError)throw error;throw new EditorError(`cannot read file: ${path}`);}
  }

  async save(document:SvgDocument,path?:string):Promise<string>{
    const target=path?resolve(path):document.sourcePath;
    if(!target)throw new EditorError("cannot write file: no path specified");
    try{await writeFile(target,document.toSvg(),"utf8");document.sourcePath=target;return target;}catch{throw new EditorError(`cannot write file: ${path??target}`);}
  }
}
