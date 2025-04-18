import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { renderer } from "./renderer";

const arButton = ARButton.createButton(renderer, {
  requiredFeatures: ["hit-test", "dom-overlay"],
  domOverlay: { root: document.body },
});

let hitTestSourceAvailable = false;
let hitTestSource: XRHitTestSource | null = null;
let localReferenceSpace: XRReferenceSpace | null = null;

async function initHitSource() {
  const session = renderer.xr.getSession();
  if (!session) {
    console.error("XR session is not available.");
    return;
  }
  const viewerSpace = await session.requestReferenceSpace("viewer");
  localReferenceSpace = await session.requestReferenceSpace("local");
  if (session.requestHitTestSource) {
    hitTestSource = (await session.requestHitTestSource({ space: viewerSpace })) || null;
  } else {
    console.error("requestHitTestSource is not supported in this session.");
    hitTestSource = null;
  }
  hitTestSourceAvailable = true;

  session.addEventListener("end", () => {
    hitTestSourceAvailable = false;
    hitTestSource = null;
  });
}

export { arButton, hitTestSourceAvailable, hitTestSource, localReferenceSpace, initHitSource };
