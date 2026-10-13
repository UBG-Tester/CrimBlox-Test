export class Instance {
  constructor(className="Instance", name=className) { this.ClassName=className; this.Name=name; this.Parent=null; this.Children=[]; this._attributes={}; this.Destroyed=false; }
  GetChildren(){return [...this.Children]}
  GetDescendants(){const out=[]; const walk=n=>n.Children.forEach(c=>{out.push(c);walk(c)});walk(this);return out}
  FindFirstChild(name,recursive=false){const hit=this.Children.find(c=>c.Name===name);if(hit||!recursive)return hit??null;for(const c of this.Children){const v=c.FindFirstChild(name,true);if(v)return v}return null}
  FindFirstChildOfClass(name){return this.Children.find(c=>c.ClassName===name)??null}
  IsA(name){return this.ClassName===name||name==="Instance"}
  SetAttribute(k,v){this._attributes[k]=v} GetAttribute(k){return this._attributes[k]??null}
  AddChild(child){if(!(child instanceof Instance))throw new TypeError("child must be an Instance");if(child===this||child.IsAncestorOf(this))throw new Error("Parenting would create a cycle");child.Remove();child.Parent=this;this.Children.push(child);return child}
  IsAncestorOf(node){for(let p=node?.Parent;p;p=p.Parent)if(p===this)return true;return false}
  Remove(){if(this.Parent){const a=this.Parent.Children;a.splice(a.indexOf(this),1);this.Parent=null}return this}
  Destroy(){this.Remove();for(const c of [...this.Children])c.Destroy();this.Children=[];this.Destroyed=true}
  Clone(){const c=new this.constructor(this.ClassName,this.Name);for(const [k,v] of Object.entries(this._attributes))c._attributes[k]=structuredClone(v);for(const ch of this.Children)c.AddChild(ch.Clone());return c}
}
export class Folder extends Instance {constructor(name="Folder"){super("Folder",name)}}
export class Model extends Instance {constructor(name="Model"){super("Model",name)}}
export class Part extends Instance {constructor(name="Part"){super("Part",name);this.Position={x:0,y:0,z:0};this.Size={x:4,y:1,z:2};this.Color="#b8b8b8";this.Anchored=true;this.Transparency=0;this.Shape="cube"}}
export class DataModel extends Instance {constructor(){super("DataModel","game");this.Workspace=this.AddChild(new Model("Workspace"));this.ReplicatedStorage=this.AddChild(new Folder("ReplicatedStorage"));this.ServerStorage=this.AddChild(new Folder("ServerStorage"));this.Players=this.AddChild(new Folder("Players"));this.Lighting=this.AddChild(new Folder("Lighting"))} GetService(name){return this.FindFirstChild(name)}}
export const game=new DataModel();
