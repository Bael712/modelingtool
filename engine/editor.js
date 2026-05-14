import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { scene, parts } from "./scene.js";

let selected = null;
let currentGroup = null;

/* =========================
   UI
========================= */

const addBtn = document.getElementById("add");
const type = document.getElementById("type");
const list = document.getElementById("list");

const newGroupBtn = document.getElementById("newGroup");
const endGroupBtn = document.getElementById("endGroup");

const dupBtn = document.getElementById("dup");
const saveBtn = document.getElementById("save");

const sx = document.getElementById("sx");
const sy = document.getElementById("sy");
const sz = document.getElementById("sz");

/* =========================
   GROUP
========================= */

function newGroup(){
    currentGroup = new THREE.Group();
    scene.add(currentGroup);
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
}

/* =========================
   ADD PART
========================= */

function addPart(){

const mesh = new THREE.Mesh(
    geo(type.value),
    new THREE.MeshStandardMaterial({
        color:0x00ffff,
        transparent:true,
        opacity:1
    })
);

mesh.position.y = 0.5;

mesh.userData = { type:type.value };

if(currentGroup){
    currentGroup.add(mesh);
}else{
    scene.add(mesh);
}

parts.push(mesh);

const opt = document.createElement("option");
opt.value = parts.length-1;
opt.textContent = type.value + " " + parts.length;
list.appendChild(opt);

select(parts.length-1);

}

/* =========================
   SELECT
========================= */

function select(i){
    selected = parts[i];
    if(!selected) return;
    list.value = i;

    sx.value = selected.scale.x;
    sy.value = selected.scale.y;
    sz.value = selected.scale.z;
}

/* =========================
   SCALE
========================= */

function updateScale(){
    if(!selected) return;
    selected.scale.set(sx.value, sy.value, sz.value);
}

sx.oninput = sy.oninput = sz.oninput = updateScale;

/* =========================
   DUPLICATE
========================= */

dupBtn.onclick = ()=>{

if(!selected) return;

const m = new THREE.Mesh(
    selected.geometry,
    selected.material.clone()
);

m.position.copy(selected.position);
m.position.x += 1;

m.scale.copy(selected.scale);
m.rotation.copy(selected.rotation);

m.userData = {...selected.userData};

if(selected.parent){
    selected.parent.add(m);
}else{
    scene.add(m);
}

parts.push(m);

const opt = document.createElement("option");
opt.value = parts.length-1;
opt.textContent = m.userData.type + " " + parts.length;
list.appendChild(opt);

select(parts.length-1);

};

/* =========================
   DELETE
========================= */

window.addEventListener("keydown",(e)=>{

if(!selected) return;

if(e.key==="Delete"){
    selected.parent.remove(selected);
    parts.splice(list.value,1);
    list.remove(list.selectedIndex);
    selected = null;
}

});

/* =========================
   MOVE
========================= */

window.addEventListener("keydown",(e)=>{

if(!selected) return;

if(e.key==="w") selected.position.z -= 0.2;
if(e.key==="s") selected.position.z += 0.2;
if(e.key==="a") selected.position.x -= 0.2;
if(e.key==="d") selected.position.x += 0.2;
if(e.key==="q") selected.position.y += 0.2;
if(e.key==="e") selected.position.y -= 0.2;

});

/* =========================
   INIT
========================= */

export function initEditor(){

addBtn.onclick = addPart;
newGroupBtn.onclick = newGroup;
endGroupBtn.onclick = endGroup;

list.onchange = ()=> select(list.value);

}