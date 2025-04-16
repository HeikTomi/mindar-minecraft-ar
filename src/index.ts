// Tuo moduulit Node.js-paketeista
import { MindARThree } from "mind-ar/dist/mindar-face-three.prod.js";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

// Käytä MindAR-kirjastoa
const mindAR = new MindARThree({ container: document.body });
mindAR.start().then(() => {
  console.log("MindAR started");
});

// Esimerkki CSS3DRendererin käytöstä
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(cssRenderer.domElement);