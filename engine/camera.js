import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

export let camera;

let camX = 0;
let camY = 0;
let dist = 10;

export function initCamera(renderer){

camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
);

let drag = false;
let lx = 0;
let ly = 0;

renderer.domElement.addEventListener("pointerdown",(e)=>{
    drag = true;
    lx = e.clientX;
    ly = e.clientY;
});

window.addEventListener("pointerup",()=>drag=false);

window.addEventListener("pointermove",(e)=>{
    if(!drag) return;

    camX += (e.clientX - lx) * 0.01;
    camY += (e.clientY - ly) * 0.01;

    lx = e.clientX;
    ly = e.clientY;
});

window.addEventListener("wheel",(e)=>{
    dist = Math.max(2, Math.min(50, dist + e.deltaY * 0.01));
});

return {
    camera,
    update(){
        camera.position.x = Math.sin(camX) * dist;
        camera.position.z = Math.cos(camX) * dist;
        camera.position.y = 5 + camY * 5;
        camera.lookAt(0,0,0);
    }
};

}