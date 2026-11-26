import { createInterface as createPromiseInterface } from "node:readline/promises";
import { createInterface as createLineInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { createEditor, type Assembly } from "./host/createEditor.js";

async function main():Promise<void>{
  const args = process.argv.slice(2);
  let assembly: Assembly;
  if (!args.length) assembly = { mode: "code" };
  else if (args.length === 1 && args[0] === "--baseline") assembly = { mode: "baseline" };
  else if (args.length === 2 && args[0] === "--config") assembly = { mode: "config", path: args[1] };
  else {
    console.log("error: usage: svg-editor [--baseline | --config <file>]");
    process.exitCode = 1;
    return;
  }
  const editor = await createEditor(assembly);
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
