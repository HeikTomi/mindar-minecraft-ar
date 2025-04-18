import { Raycaster, Vector2, Vector3 } from "three";
import { scene, camera } from "../core/scene";
import { renderer } from "../core/renderer";
import { pickaxeButtonDiv, swordButtonDiv, inventoryDiv } from "../ui/ui";
import { animateWeaponToTarget } from "./animations";
import { reticle } from "../objects/reticle";
import { getIsAnimating } from "../loaders/modelLoader";

const raycaster = new Raycaster();

window.addEventListener("click", (event) => {
  if (getIsAnimating()) {
    console.log("Animation in progress. Please wait.");
    return;
  }

  if (event.target === pickaxeButtonDiv || event.target === swordButtonDiv) {
    console.log("Button clicked. Ignoring scene interaction.");
    return;
  }

  let clickedInventoryItem = false;
  let element = event.target as HTMLElement;
  while (element) {
    if (element.classList && element.classList.contains("inventory-item")) {
      clickedInventoryItem = true;
      break;
    }
    element = element.parentNode as HTMLElement;
  }

  if (clickedInventoryItem) {
    console.log("Clicked on inventory item. Ignoring scene interaction.");
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new Vector2();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  let targetPosition = new Vector3();

  const sceneIntersects = raycaster.intersectObjects(scene.children, true);

  if (sceneIntersects.length > 0) {
    const hitObject = sceneIntersects[0].object;
    console.log("Intersected scene object:", hitObject.name);

    targetPosition = sceneIntersects[0].point;
    console.log("Target position:", targetPosition);
  } else {
    targetPosition.setFromMatrixPosition(reticle.matrix);
  }

  const weapon = scene.getObjectByName("weapon");
  if (weapon) {
    animateWeaponToTarget(weapon, targetPosition);
  } else {
    console.log("No weapon found to animate. Please select a weapon first.");
  }
  return;
});

export { raycaster };
