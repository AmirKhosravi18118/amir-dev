/* Loads the locale catalog matching the page language (DE default). All JS-generated user-visible strings come from it. */
const LOC=document.documentElement.lang==='en'?'en':'de';
let T={};
export async function loadStrings(){
  try{const r=await fetch('/i18n/'+LOC+'.json');if(r.ok)T=await r.json();}catch(e){}
}
export const t=k=>(T[k]!=null?String(T[k]):k);
