import { Object3D } from "three";

export interface Block {
  name: string;
  imagePath: string;
  modelPath: string;
  count: number;
}

export interface Monster extends Object3D {
  userData: {
    health: number;
    healthBarGreen: HTMLElement;
  }
}
