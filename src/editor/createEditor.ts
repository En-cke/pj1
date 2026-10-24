import { FileService } from "../io/FileService.js";
import { SvgParser } from "../io/SvgParser.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { Tokenizer } from "../parser/Tokenizer.js";
import { CommandDispatcher } from "./CommandDispatcher.js";
import { Editor } from "./Editor.js";

export function createEditor():Editor{const factory=new ShapeFactory();const files=new FileService(new SvgParser(factory));return new Editor(new Tokenizer(),new CommandDispatcher(factory,files));}
