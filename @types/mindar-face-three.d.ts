declare module "mind-ar/dist/mindar-face-three.prod.js" {
  import { Scene, PerspectiveCamera, WebGLRenderer } from "three";

  export class MindARThree {
    constructor(options: { container: HTMLElement });
    start(): Promise<void>;
    stop(): void;
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
  }
}