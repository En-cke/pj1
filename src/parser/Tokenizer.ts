import { EditorError } from "../model/EditorError.js";

export class Tokenizer {
  tokenize(line:string):string[]{
    const input=line.trim();if(input===""||input.startsWith("#"))return [];
    const tokens:string[]=[];let current="";let quoted=false;let active=false;
    for(let i=0;i<input.length;i++){
      const char=input[i];
      if(char==='"'){quoted=!quoted;active=true;continue;}
      if(/\s/.test(char)&&!quoted){if(active){tokens.push(current);current="";active=false;}continue;}
      current+=char;active=true;
    }
    if(quoted)throw new EditorError("unterminated quoted string");
    if(active)tokens.push(current);return tokens;
  }
}
