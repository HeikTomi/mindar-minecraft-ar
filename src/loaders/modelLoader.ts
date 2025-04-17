import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { scene, camera } from "../core/scene";
import { rotateWeaponIdle } from "../interactions/animations";

const loader = new GLTFLoader();
let _isAnimating = false;

export const getIsAnimating = () => _isAnimating;

export const setIsAnimating = (value: boolean) => {
    _isAnimating = value;
}


const loadModel = (modelPath: string) => {
  if (getIsAnimating()) return;

  loader.load(
    modelPath,
    (gltf) => {
      const oldWeapon = camera.getObjectByName("weapon");
      if (oldWeapon) {
        camera.remove(oldWeapon);
      }

      const weapon = gltf.scene;
      weapon.name = "weapon";
      weapon.userData.assetPath = modelPath;
      weapon.position.set(0, -0.5, -1.75);
      weapon.scale.set(0.3, 0.3, 0.3);
      camera.add(weapon);

      rotateWeaponIdle(weapon);
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
    }
  );
};

export { loader, loadModel};
