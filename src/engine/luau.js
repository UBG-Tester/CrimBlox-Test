// Safe, intentionally small Luau-like command runner. It does not use eval or Function.
export class LuauVM {
 constructor({game=null,print=console.log}={}){this.game=game;this.print=print;this.globals=new Map();this.output=[]}
 execute(source){this.output=[];for(const raw of String(source).split(/\r?\n/)){const line=raw.trim();if(!line||line.startsWith("--"))continue;let m;
 if((m=line.match(/^print\((.*)\)$/))){const v=this.value(m[1]);this.output.push(String(v));this.print(v);continue}
 if((m=line.match(/^(?:local\s+)?([\w]+)\s*=\s*(.+)$/))){this.globals.set(m[1],this.value(m[2]));continue}
 if((m=line.match(/^([\w.]+):Destroy\(\)$/))){this.resolve(m[1])?.Destroy?.();continue}
 if((m=line.match(/^([\w.]+):ClearAllChildren\(\)$/))){const n=this.resolve(m[1]);n?.GetChildren?.().forEach(c=>c.Destroy());continue}
 if((m=line.match(/^([\w.]+)\.Name\s*=\s*["'](.*?)["']$/))){const n=this.resolve(m[1]);if(n)n.Name=m[2];continue}
 throw new SyntaxError("Unsupported Luau statement: "+line)}
 return {output:[...this.output],globals:Object.fromEntries(this.globals)}}
 value(s){s=s.trim();if(/^["']/.test(s))return s.slice(1,-1);if(s==="true")return true;if(s==="false")return false;if(s==="nil")return null;if(!Number.isNaN(Number(s)))return Number(s);return this.resolve(s)??this.globals.get(s)}
 resolve(path){let v=this.globals.get(path);if(v)return v;const parts=path.split(".");v=parts[0]==="game"?this.game:this.globals.get(parts[0]);for(const p of parts.slice(1)){if(!v)return null;v=typeof v.GetService==="function"?v.GetService(p):typeof v.FindFirstChild==="function"?v.FindFirstChild(p):v[p]}return v??null}
}
export function executeLuau(source,options){return new LuauVM(options).execute(source)}
