import { scene, camera } from "./core/scene";
import { renderer, labelRenderer } from "./core/renderer";
import { arButton, hitTestSourceAvailable, hitTestSource, localReferenceSpace, initHitSource } from "./core/ar";
import { loadModel } from "./loaders/modelLoader";
import { pickaxeButtonDiv, swordButtonDiv } from "./ui/ui";
import { raycaster } from "./interactions/interactions";
import { animateWeaponToTarget, rotateWeaponIdle } from "./interactions/animations";
import { reticle, updateReticle } from "./objects/reticle";
import { updateScores, score } from "./utils/utils";
import { Block, Monster } from "./types/types";

// Lisää kamera sceneen, jotta painikkeet näkyvät
scene.add(camera);

// Lisää hakku-painike DOM:iin
document.body.appendChild(pickaxeButtonDiv);

// Lisää miekka-painike DOM:iin
document.body.appendChild(swordButtonDiv);

// Lisää AR-painike DOM:iin
document.body.appendChild(arButton);

// Blokkien tiedot
const blocks: Block[] = [
  { name: "beige", imagePath: "./assets/minecraft_blocks_beige.png", modelPath: "./assets/minecraft_blocks_beige.glb", count: 1 },
  { name: "brown", imagePath: "./assets/minecraft_blocks_brown.png", modelPath: "./assets/minecraft_blocks_brown.glb", count: 1 },
  { name: "green", imagePath: "./assets/minecraft_blocks_green.png", modelPath: "./assets/minecraft_blocks_green.glb", count: 1 },
  { name: "grey", imagePath: "./assets/minecraft_blocks_grey.png", modelPath: "./assets/minecraft_blocks_grey.glb", count: 1 },
];

// Funktion animaatio
const animate = () => {
  renderer.setAnimationLoop((_, frame) => {
    if (frame) {
      if (!hitTestSourceAvailable) {
        initHitSource(); // Alusta hit-test-lähde, jos sitä ei ole
      }
      updateReticle(frame); // Päivitä reticle WebXR:n hit-test-tulosten perusteella
    }

    renderer.render(scene, camera); // Renderöi 3D-näkymä
    labelRenderer.render(scene, camera); // Renderöi CSS2D-elementit, kuten kello
  });
};
animate();

// Päivitä kamera, kun ikkunan koko muuttuu
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

export { blocks }
