import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

import { scene, initScene } from "./engine/scene.js";
import { initCamera } from "./engine/camera.js";
import { initEditor } from "./engine/editor.js";

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

initScene();

const cam = initCamera(renderer);
initEditor();

scene.add(new THREE.GridHelper(50,50));

const light = new THREE.DirectionalLight(0xffffff,3);
light.position.set(5,10,7);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff,1));

function animate(){
    requestAnimationFrame(animate);
    cam.update();
    renderer.render(scene, cam.camera);
}

animate();