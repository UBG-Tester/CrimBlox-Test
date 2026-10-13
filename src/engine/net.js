export class NetClient {
 constructor(url){this.url=url;this.socket=null;this.handlers=new Map();this.queue=[]}
 connect(){if(typeof WebSocket==="undefined")throw new Error("WebSocket is unavailable in this runtime");return new Promise((resolve,reject)=>{const ws=this.socket=new WebSocket(this.url);ws.addEventListener("open",()=>{for(const m of this.queue)ws.send(JSON.stringify(m));this.queue=[];resolve(this)});ws.addEventListener("message",e=>{let m;try{m=JSON.parse(e.data)}catch{return}for(const fn of this.handlers.get(m.type)||[])fn(m)});ws.addEventListener("error",reject)})}
 on(type,fn){if(!this.handlers.has(type))this.handlers.set(type,new Set());this.handlers.get(type).add(fn);return()=>this.handlers.get(type)?.delete(fn)}
 send(type,payload={}){const m={type,payload,ts:Date.now()};if(this.socket?.readyState===1)this.socket.send(JSON.stringify(m));else this.queue.push(m)}
 close(){this.socket?.close();this.socket=null}
}
export function createMessage(type,payload={}){return {type,payload,ts:Date.now()}}
