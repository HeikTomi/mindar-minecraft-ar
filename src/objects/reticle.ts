import { RingGeometry, MeshBasicMaterial, Mesh, MathUtils } from "three";
import { scene } from "../core/scene";

const reticleGeometry = new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
const reticleMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
const reticle = new Mesh(reticleGeometry, reticleMaterial);
reticle.visible = false;
scene.add(reticle);

const updateReticle = (frame: XRFrame) => {
  if (!hitTestSourceAvailable || !hitTestSource || !localReferenceSpace) return;

  const hitTestResults = frame.getHitTestResults(hitTestSource);

  if (hitTestResults.length) {
    const hit = hitTestResults[0];
    reticle.visible = true;
    const hitPose = hit.getPose(localReferenceSpace);
    if (hitPose) {
      reticle.matrix.fromArray(hitPose.transform.matrix);
      reticle.matrix.decompose(reticle.position, reticle.quaternion, reticle.scale);
    }
  } else {
    reticle.visible = false;
  }
};

export { reticle, updateReticle };
