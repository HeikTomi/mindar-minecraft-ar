import {
    Scene,
    Box3,
    Mesh,
    Vector3,
  } from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { updateScores } from "../utils/utils";
  
  const loader = new GLTFLoader();
  
  const createBlock = (
    blockModelPath: string,
    reticlePosition: Vector3,
    scene: Scene
  ) => {
    loader.load(
      blockModelPath,
      (gltf) => {
        const blockObject = gltf.scene;
        blockObject.name = "block";
        blockObject.scale.set(0.7, 0.7, 0.7);
  
        const boundingBox = new Box3().setFromObject(blockObject);
        const blockHeight = boundingBox.max.y - boundingBox.min.y;
  
        let highestY = reticlePosition.y;
        scene.traverse((object) => {
          if (object.name === "block") {
            const horizontalDistance = Math.sqrt(
              Math.pow(object.position.x - reticlePosition.x, 2) +
                Math.pow(object.position.z - reticlePosition.z, 2)
            );
            if (horizontalDistance < 0.2) {
              highestY = Math.max(highestY, object.position.y + blockHeight);
            }
          }
        });
  
        blockObject.position.set(reticlePosition.x, highestY, reticlePosition.z);
        scene.add(blockObject);
  
        updateScores(25);
        console.log(`Placed block at reticle position.`);
      },
      undefined,
      (error) => {
        console.error("Error loading block model:", error);
      }
    );
  };
  
  export { createBlock };
  