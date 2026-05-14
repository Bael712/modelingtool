import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { scene, parts } from "./scene.js";

let selected = null;
let currentGroup = null;
const groups = [];

/* =========================
   UI SAFE BIND
========================= */

const get = (id)=>document.getElementById(id);

/* 必須UI */
const addBtn = get("add");
const type = get("type");
const newGroupBtn = get("newGroup");
const endGroupBtn = get("endGroup");
const saveBtn = get("save");
const loadInput = get("load");
const hierarchy = get("hierarchy");

const sx = get("sx");
const sy = get("sy");
const sz = get("sz");

/* =========================
   GROUP
========================= */

function newGroup(){
    const g = {
        name:"Group_" + (groups.length+1),
        objects:[]
    };

    groups.push(g);
    currentGroup = g;

    renderHierarchy();
}

function endGroup(){
    currentGroup = null;
}

/* =========================
   GEO
========================= */

function geo(t){

if(t==="box") return new THREE.BoxGeometry(1,1,1);
if(t==="sphere") return new THREE.SphereGeometry(0.7,32,32);
if(t==="cylinder") return new THREE.CylinderGeometry(0.5,0.5,1.5,32);
if(t==="cone") return new THREE.ConeGeometry(0.7,1.5,32);

return new THREE.BoxGeometry(1,1,1);

}

/* =========================
   ADD
========================= */

function addPart(){

const mesh = new THREE.Mesh(
    geo(type.value),
    new THREE.MeshStandardMaterial({ color:0x00ffff })
);

mesh.position.y = 0.5;

mesh.userData.type = type.value;

scene.add(mesh);
parts.push(mesh);

if(currentGroup){
    currentGroup.objects.push(mesh);
}

renderHierarchy();

}

/* =========================
   SELECT SAFE
========================= */

function select(obj){
    selected = obj;
}

/* =========================
   SCALE
========================= */

function updateScale(){

if(!selected) return;

selected.scale.set(
    sx.value,
    sy.value,
    sz.value
);

}

sx.oninput = sy.oninput = sz.oninput = updateScale;

/* =========================
   DELETE SAFE
========================= */

window.addEventListener("keydown",(e)=>{

if(!selected) return;

if(e.key==="Delete"){

    selected.parent.remove(selected);

    const idx = parts.indexOf(selected);
    if(idx >= 0) parts.splice(idx,1);

    selected = null;

    renderHierarchy();
}

});

/* =========================
   SAVE SAFE
========================= */

function serialize(obj){

if(obj.type === "Group"){

return {
    type:"group",
    children:obj.children.map(serialize)
};

}

return {
    type:obj.userData?.type || "box",
    position:obj.position,
    rotation:obj.rotation,
    scale:obj.scale
};

}

saveBtn.onclick = ()=>{

const roots = scene.children.filter(c => c.parent === scene);

const data = roots.map(serialize);

const blob = new Blob(
    [JSON.stringify(data,null,2)],
    {type:"application/json"}
);

const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "asset.json";
a.click();

URL.revokeObjectURL(url);

};

/* =========================
   LOAD SAFE FIX（ここが重要）
========================= */

if(loadInput){

loadInput.onchange = (e)=>{

const file = e.target.files[0];
if(!file) return;

const reader = new FileReader();

reader.onload = (ev)=>{

const data = JSON.parse(ev.target.result);

data.forEach(d=>build(d));

renderHierarchy();

};

reader.readAsText(file);

};

}

/* =========================
   BUILD
========================= */

function build(data){

if(data.type === "group"){

const g = new THREE.Group();

data.children.forEach(c=>{
    g.add(build(c));
});

scene.add(g);
return g;

}

let g;

if(data.type==="box") g = new THREE.BoxGeometry(1,1,1);
if(data.type==="sphere") g = new THREE.SphereGeometry(0.7,32,32);
if(data.type==="cylinder") g = new THREE.CylinderGeometry(0.5,0.5,1.5,32);

const m = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({ color:0x00ffff })
);

m.position.copy(data.position || {x:0,y:0,z:0});
m.scale.copy(data.scale || {x:1,y:1,z:1});

scene.add(m);
parts.push(m);

return m;

}

/* =========================
   HIERARCHY
========================= */

function renderHierarchy(){

if(!hierarchy) return;

hierarchy.innerHTML = "";

groups.forEach(g=>{

const div = document.createElement("div");
div.className = "group";
div.textContent = g.name;

const child = document.createElement("div");

g.objects.forEach(obj=>{

const item = document.createElement("div");
item.className = "item";
item.textContent = obj.userData?.type || "object";

item.onclick = ()=>select(obj);

child.appendChild(item);

});

div.appendChild(child);
hierarchy.appendChild(div);

});

}

/* =========================
   INIT SAFE
========================= */

export function initEditor(){

if(addBtn) addBtn.onclick = addPart;
if(newGroupBtn) newGroupBtn.onclick = newGroup;
if(endGroupBtn) endGroupBtn.onclick = endGroup;

}