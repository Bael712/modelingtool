import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

export const scene = new THREE.Scene();
export const parts = [];

export function initScene(){
    scene.background = new THREE.Color(0x222222);
}