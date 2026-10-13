import { Renderer } from './renderer.js';
import { DataModel, Part } from './engine/datamodel.js';
import { serialize } from './engine/serialize.js';
import { LuauVM } from './engine/luau.js';
const $=id=>document.getElementById(id),canvas=$("c"),hud=$("hud"),model=new DataModel(),renderer=new Renderer(canvas);
const base=new Part("Baseplate");base.Size={x:40,y:1,z:40};base.Position={x:0,y:-1,z:0};base.Color="#4e9b55";model.Workspace.AddChild(base);
for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){const p=new Part("Block");p.Position={x:x*3,y:1,z:z*3};p.Color=x===0&&z===0?"#bd3542":"#b9b9c2";model.Workspace.AddChild(p)}
const update=()=>{renderer.parts=model.Workspace.GetDescendants().filter(n=>n.Position&&n.Size);renderer.render();hud.textContent="CrimBlox Web Engine • "+renderer.parts.length+" parts • WebGL2 "+(renderer.ready?"ready":renderer.error||"starting");requestAnimationFrame(update)};
await renderer.init();update();
$("scriptBtn")?.addEventListener("click",()=>$("panel").classList.toggle("show"));
$("run")?.addEventListener("click",()=>{try{const vm=new LuauVM({game:model,print:v=>{const out=$("out");out.textContent+=String(v)+"\n"}});vm.execute($("src").value)}catch(e){$("out").textContent+="Error: "+e.message+"\n"}});
$("openBtn")?.addEventListener("click",()=>$("openFile").click());
$("openFile")?.addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{const t=await f.text();$("src").value=t;$("panel").classList.add("show")}catch(err){hud.textContent=err.message}});
const download=(name,text,type="application/json")=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
$("saveXml")?.addEventListener("click",()=>download("place.cblx",serialize(model),"application/json"));
$("saveBin")?.addEventListener("click",()=>download("place.cbxm",serialize(model),"application/octet-stream"));
$("skyBtn")?.addEventListener("click",()=>$("skyFile").click());
$("skyReset")?.addEventListener("click",()=>{canvas.style.background="";});
$("skyFile")?.addEventListener("change",async e=>{const f=e.target.files?.[0];if(f)canvas.style.backgroundImage="url("+URL.createObjectURL(f)+")"});
