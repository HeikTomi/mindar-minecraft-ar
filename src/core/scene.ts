import { Scene, PerspectiveCamera, AmbientLight, DirectionalLight } from "three";

const scene = new Scene();
const camera = new PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

export { scene, camera };
