import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createEditor } from "./editor/createEditor.js";

const editor=createEditor();
const terminal=createInterface({input,output,terminal:true});
console.log("svg-editor 0.1 — type 'help' for commands");

while(true){
  let line:string;
  try{line=await terminal.question("svg> ");}catch{break;}
  if(line.trim()==="exit"||line.trim()==="quit")break;
  const result=await editor.executeLine(line);if(result)console.log(result);
}
terminal.close();
