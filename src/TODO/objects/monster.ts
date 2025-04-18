import {
    Scene,
    Object3D,
    Vector3,
  } from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
  import { updateScores } from "../utils/utils";
  
  const loader = new GLTFLoader();
  
  const createMonster = (
    monsterModelPath: string,
    position: Vector3,
    scene: Scene
  ) => {
    loader.load(
      monsterModelPath,
      (gltf) => {
        const monster = gltf.scene;
        monster.name = "monster_";
        monster.scale.set(0.7, 0.7, 0.7);
        monster.position.copy(position);
  
        monster.userData.health = 4;
  
        const healthBar = document.createElement("div");
        healthBar.className = "health-bar";
        healthBar.style.backgroundColor = "red";
        healthBar.style.width = "100%";
        healthBar.style.height = "5px";
        healthBar.style.position = "relative";
        healthBar.style.top = "-10px";
        healthBar.style.zIndex = "10"; // varmista, että health bar näkyy
  
        const healthBarGreen = document.createElement("div");
        healthBarGreen.style.backgroundColor = "green";
        healthBarGreen.style.width = "100%";
        healthBarGreen.style.height = "5px";
  
        healthBar.appendChild(healthBarGreen);
  
        const healthBarLabel = new CSS2DObject(healthBar);
        healthBarLabel.position.set(0, 1, 0);
        monster.add(healthBarLabel);
  
        monster.userData.healthBarGreen = healthBarGreen;
  
        scene.add(monster);
  
        console.log(`Created monster`);
      },
      undefined,
      (error) => {
        console.error("Error loading monster model:", error);
      }
    );
  };
  
  export { createMonster };
  