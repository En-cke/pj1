import { createInterface as createPromiseInterface } from "node:readline/promises";
import { createInterface as createLineInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { createEditor } from "./editor/createEditor.js";

async function main():Promise<void>{
  const editor=createEditor();
  console.log("svg-editor 0.1 — type 'help' for commands");
  if(!input.isTTY){
    const lines=createLineInterface({input,crlfDelay:Infinity});
    for await(const line of lines){
      if(line.trim()==="exit"||line.trim()==="quit")break;
      const result=await editor.executeLine(line);if(result)console.log(result);
    }
    return;
  }

  const terminal=createPromiseInterface({input,output,terminal:true});
  while(true){
    let line:string;
    try{line=await terminal.question("svg> ");}catch{break;}
    if(line.trim()==="exit"||line.trim()==="quit")break;
    const result=await editor.executeLine(line);if(result)console.log(result);
  }
  terminal.close();
}

void main();
