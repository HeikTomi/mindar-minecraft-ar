import { Object3D, Vector3, Raycaster } from "three";
import { scene, camera } from "../core/scene";
import { blocks } from "../../index";
import { loader, getIsAnimating, setIsAnimating } from "../loaders/modelLoader";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { updateScores } from "../utils/utils";
import { inventoryDiv } from "../ui/ui";
import { Monster } from "../types/types";

const animateWeaponToTarget = (weapon: Object3D, targetPosition: Vector3) => {
  if (getIsAnimating()) return;
  setIsAnimating(true);

  weapon.rotation.set(0, 0, 0);
  scene.remove(weapon);
  scene.add(weapon);

  const initialPosition = weapon.position.clone();
  const initialRotation = weapon.rotation.clone();

  let progress = 0;

  const animationLoop = () => {
    if (progress < 1) {
      progress += 0.03;
      weapon.position.lerpVectors(initialPosition, targetPosition, progress);

      weapon.rotation.x += 0.2;
      weapon.rotation.y += 0.1;
    } else {
      const raycaster = new Raycaster();
      raycaster.set(weapon.position, targetPosition.clone().sub(weapon.position).normalize());
      const intersects = raycaster.intersectObjects(scene.children, true);

      let hitSomething = false;

      for (const intersect of intersects) {
        const monster = intersect.object.parent as Monster;
        if (monster && monster.name.startsWith("monster_")) {
          hitSomething = true;
          const damage = weapon && weapon.userData.assetPath.includes("pickaxe") ? 1 : 4;
          monster.userData.health -= damage;

          const maxHealth = 4;
          const healthPercentage = Math.max(0, (monster.userData.health / maxHealth) * 100);
          monster.userData.healthBarGreen.style.width = `${healthPercentage}%`;

          if (monster.userData.health <= 0) {
            console.log(`Monster ${monster.name} defeated!`);

            const healthBarLabel = monster.children.find((child) => child instanceof CSS2DObject);
            if (healthBarLabel) {
              monster.remove(healthBarLabel);
            }

            scene.remove(monster);

            updateScores(50);
            //console.log(`Score updated: ${score}`);
          }
          break;
        }

        if (intersect.object.name === "block") {
          hitSomething = true;
          console.log("Hit a block. No new block will be found.");
          break;
        }
      }

      if (!hitSomething && weapon.userData.assetPath.includes("pickaxe")) {
        console.log("Hit an empty spot. Checking for new block...");
        if (Math.random() < 0.5) {
          console.log("Found a new block!");

          const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];

          loader.load(randomBlock.modelPath, (gltf) => {
            const spinningBlock = gltf.scene;
            spinningBlock.name = "spinningBlock";
            spinningBlock.scale.set(0.7, 0.7, 0.7);
            spinningBlock.position.copy(targetPosition);
            scene.add(spinningBlock);

            const spinAnimation = () => {
              spinningBlock.rotation.y += 0.05;
              if (spinningBlock.userData.remove) {
                scene.remove(spinningBlock);
                return;
              }
              requestAnimationFrame(spinAnimation);
            };
            spinAnimation();

            setTimeout(() => {
              randomBlock.count++;
              const blockDiv = inventoryDiv.querySelector(`.inventory-item[data-block-name="${randomBlock.name}"]`);
              if (blockDiv) {
                const blockCountElement = blockDiv.querySelector(".block-count") as HTMLElement;
                if (blockCountElement) {
                  blockCountElement.innerText = `${randomBlock.count}`;
                }
              }
              spinningBlock.userData.remove = true;
              console.log(`Added ${randomBlock.name} to inventory.`);
            }, 2000);
          });
        } else {
          console.log("No block found.");
        }
      }

      weapon.visible = false;

      setTimeout(() => {
        weapon.position.copy(initialPosition);
        weapon.rotation.copy(initialRotation);
        weapon.visible = true;
        scene.remove(weapon);
        camera.add(weapon);
        setIsAnimating(false);
      }, 500);
      return;
    }
    requestAnimationFrame(animationLoop);
  };

  animationLoop();
};

const rotateWeaponIdle = (weapon: Object3D) => {
  const idleAnimationLoop = () => {
    if (!getIsAnimating()) { // Pyöritä vain, jos animaatio ei ole käynnissä
      weapon.rotation.y += 0.02; // Pyöritä X-akselin ympäri
    }
    requestAnimationFrame(idleAnimationLoop);
  };

  idleAnimationLoop();
};

export { animateWeaponToTarget, rotateWeaponIdle };
