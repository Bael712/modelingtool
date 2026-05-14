import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { scene, parts } from "./scene.js";

/* =========================
   STATE
========================= */

let selected = null;
let currentGroup = null;

const groups = [];

/* =========================
   UI
========================= */

const addBtn = document.getElementById("add");
const type = document.getElementById("type");

const newGroupBtn = document.getElementById("newGroup");
const endGroupBtn = document.getElementById("endGroup");

const saveBtn = document.getElementById("save");
const loadInput = document.getElementById("load");

const hierarchy = document.getElementById("hierarchy");

const sx = document.getElementById("sx");
const sy = document.getElementById("sy");
const sz = document.getElementById("sz");

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
   GEOMETRY
========================= */

function geo(t){

if(t==="box") return new THREE.BoxGeometry(1,1,1);
if(t==="sphere") return new THREE.SphereGeometry(0.7,32,32);
if(t==="cylinder") return new THREE.CylinderGeometry(0.5,0.5,1.5,32);
if(t==="cone") return new THREE.ConeGeometry(0.7,1.5,32);
if(t==="torus") return new THREE.TorusGeometry(0.6,0.2,16,100);
if(t==="capsule") return new THREE.CapsuleGeometry(0.5,1,4,8);

return new THREE.BoxGeometry(1,1,1);

}

/* =========================
   ADD
========================= */

function addPart(){

const mesh = new THREE.Mesh(
    geo(type.value),
    new THREE.MeshStandardMaterial({
        color:0x00ffff
    })
);

mesh.position.y = 0.5;

scene.add(mesh);
parts.push(mesh);

if(currentGroup){
    currentGroup.objects.push(mesh);
}

renderHierarchy();

select(parts.length-1);

}

/* =========================
   SELECT
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
   DUPLICATE
========================= */

document.getElementById("dup").onclick = ()=>{

if(!selected) return;

const m = new THREE.Mesh(
    selected.geometry,
    selected.material.clone()
);

m.position.copy(selected.position);
m.position.x += 1;

scene.add(m);
parts.push(m);

select(m);

};

/* =========================
   DELETE
========================= */

window.addEventListener("keydown",(e)=>{

if(!selected) return;

if(e.key==="Delete"){

selected.parent.remove(selected);
parts.splice(parts.indexOf(selected),1);

selected = null;

renderHierarchy();

}

});

/* =========================
   SAVE
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
   LOAD
========================= */

loadInput.onchange = (e)=>{

const file = e.target.files[0];
if(!file) return;

const reader = new FileReader();

reader.onload = (ev)=>{

const data = JSON.parse(ev.target.result);

data.forEach(d=>{
    build(d);
});

renderHierarchy();

};

reader.readAsText(file);

};

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

m.position.copy(data.position);
m.scale.copy(data.scale);

scene.add(m);
parts.push(m);

return m;

}

/* =========================
   HIERARCHY UI
========================= */

function renderHierarchy(){

hierarchy.innerHTML = "";

groups.forEach((g)=>{

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
   INIT
========================= */

export function initEditor(){

addBtn.onclick = addPart;
newGroupBtn.onclick = newGroup;
endGroupBtn.onclick = endGroup;

}