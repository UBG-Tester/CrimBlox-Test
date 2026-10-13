import { Instance, DataModel, Folder, Model, Part } from './datamodel.js';
const classes={Instance,DataModel,Folder,Model,Part};
const pack=v=>{if(v instanceof Map)return {$type:"Map",value:[...v].map(([k,x])=>[k,pack(x)])};if(v instanceof Set)return {$type:"Set",value:[...v].map(pack)};if(Array.isArray(v))return v.map(pack);if(v&&typeof v==="object"){const o={};for(const [k,x] of Object.entries(v))if(typeof x!=="function"&&k!=="Parent")o[k]=pack(x);return o}return v};
export function serializeInstance(node){return {ClassName:node.ClassName,Name:node.Name,Attributes:pack(node._attributes??{}),Properties:pack(Object.fromEntries(Object.entries(node).filter(([k,v])=>!["Parent","Children","_attributes","Destroyed"].includes(k)&&typeof v!=="function"&&k!=="ClassName"&&k!=="Name"))),Children:(node.Children??[]).map(serializeInstance)}}
export function serialize(root){return JSON.stringify(serializeInstance(root))}
export function deserialize(data){const o=typeof data==="string"?JSON.parse(data):data;const C=classes[o.ClassName]??Instance;const n=C===Instance?new Instance(o.ClassName,o.Name):new C(o.Name);n._attributes=o.Attributes??{};Object.assign(n,o.Properties??{});for(const child of o.Children??[])n.AddChild(deserialize(child));return n}
export const encode=serialize;export const decode=deserialize;
