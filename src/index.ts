// Tuo Three.js-moduulit
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Sprite, SpriteMaterial, TextureLoader, Raycaster, Vector2, ArrowHelper, PlaneGeometry, MeshBasicMaterial, Mesh, Texture, LinearFilter, RGBFormat, Object3D, Vector3, Matrix4, RingGeometry, Matrix3, Quaternion, BoxHelper } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton"; // WebXR-painike
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

// Luo Three.js-scene ja kamera
const scene = new Scene();
const camera = new PerspectiveCamera(
  50, // Field of View (FOV)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Läheisin leikkaustaso
  1000 // Kaukaisin leikkaustaso
);
camera.position.z = 2; // Aseta kamera hieman kauemmaksi

// Lisää valot sceneen
const ambientLight = new AmbientLight(0xffffff, 1); // Yleinen valo
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 1); // Suunnattu valo
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Luo renderer
const renderer = new WebGLRenderer({ alpha: true }); // Alpha mahdollistaa läpinäkyvän taustan
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true; // Ota WebXR käyttöön
document.body.appendChild(renderer.domElement);

// Luo CSS2DRenderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
document.body.appendChild(labelRenderer.domElement);

// Lisää WebXR-painike DOM Overlay -tuella
document.body.appendChild(
  ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test", "dom-overlay"],
    domOverlay: { root: document.body }, // Aseta HTML-elementtien juuri
  })
);

// Poista oletustyylit
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden"; // Poistaa scrollbarit

// Luo 3D-mallin lataaja
const loader = new GLTFLoader();

// Funktio 3D-mallin lataamiseen
const loadModel = (modelPath: string) => {
  if(isAnimating) return; // Estä lataus, jos animaatio on käynnissä
  
  loader.load(
    modelPath,
    (gltf) => {
      // Poista vanha ase, jos sellainen on
      const oldWeapon = camera.getObjectByName("weapon");
      if (oldWeapon) {
        camera.remove(oldWeapon);
      }

      // Lisää uusi ase kameran lapseksi
      const weapon = gltf.scene;
      weapon.name = "weapon";
      weapon.position.set(0, -0.5, -1.75); // Aseta ase kameran eteen
      weapon.scale.set(0.3, 0.3, 0.3); // Skaalaa ase sopivaksi
      camera.add(weapon);

      // Käynnistä idle-pyöritys
      rotateWeaponIdle(weapon);
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
    }
  );
};

// Lisää kamera sceneen, jotta painikkeet näkyvät
scene.add(camera);

// Luo hakku-painike HTML-elementtinä
const pickaxeButtonDiv = document.createElement("div");
pickaxeButtonDiv.style.width = "50px"; // Aseta painikkeen leveys
pickaxeButtonDiv.style.height = "50px"; // Aseta painikkeen korkeus
pickaxeButtonDiv.style.backgroundImage = "url('./assets/mc_pickaxe_diamond.png')"; // Aseta taustakuva
pickaxeButtonDiv.style.backgroundSize = "cover"; // Skaalaa kuva täyttämään painike
pickaxeButtonDiv.style.backgroundPosition = "center"; // Keskitä kuva
pickaxeButtonDiv.style.backgroundSize = "90%"; // Keskitä kuva
pickaxeButtonDiv.style.backgroundRepeat = "no-repeat"; // Keskitä kuva
pickaxeButtonDiv.style.border = "solid 5px black"; // Pyöristetyt kulmat
pickaxeButtonDiv.style.borderRadius = "5px"; // Pyöristetyt kulmat
pickaxeButtonDiv.style.cursor = "pointer";
pickaxeButtonDiv.onclick = () => {
  console.log("Pickaxe selected");
  loadModel("./assets/Minecraft_pickaxe.glb");
};

// Luo CSS2DObject hakku-painikkeelle
const pickaxeButtonLabel = new CSS2DObject(pickaxeButtonDiv);
pickaxeButtonLabel.position.set(-0.1, -0.42, -1); // Aseta painike kameran eteen
camera.add(pickaxeButtonLabel);

// Luo miekka-painike HTML-elementtinä
const swordButtonDiv = document.createElement("div");
swordButtonDiv.style.width = "50px"; // Aseta painikkeen leveys
swordButtonDiv.style.height = "50px"; // Aseta painikkeen korkeus
swordButtonDiv.style.backgroundImage = "url('./assets/mc_sword_enchanted.jpeg')"; // Aseta taustakuva
swordButtonDiv.style.backgroundSize = "cover"; // Skaalaa kuva täyttämään painike
swordButtonDiv.style.backgroundPosition = "center"; // Keskitä kuva
swordButtonDiv.style.backgroundSize = "90%"; // Keskitä kuva
swordButtonDiv.style.backgroundRepeat = "no-repeat"; // Keskitä kuva
swordButtonDiv.style.border = "solid 5px black"; // Pyöristetyt kulmat
swordButtonDiv.style.borderRadius = "5px"; // Pyöristetyt kulmat
swordButtonDiv.style.cursor = "pointer";
swordButtonDiv.onclick = () => {
  console.log("Sword selected");
  loadModel("./assets/Minecraft_sword.glb");
};

// Luo CSS2DObject miekka-painikkeelle
const swordButtonLabel = new CSS2DObject(swordButtonDiv);
swordButtonLabel.position.set(0.1, -0.42, -1); // Aseta painike kameran eteen
camera.add(swordButtonLabel);

// Lisää tapahtumakäsittelijät 3D-painikkeille
const raycaster = new Raycaster();

// Päivitä tapahtumakäsittelijä
window.addEventListener("click", (event) => {
  if (isAnimating) {
    console.log("Animation in progress. Please wait.");
    return; // Estä kaikki toiminta, jos animaatio on käynnissä
  }

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new Vector2();

  // Muunna kosketuskoordinaatit Three.js:n koordinaatistoon
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Tarkista osumat sceneen lisättyihin objekteihin
  const sceneIntersects = raycaster.intersectObjects(scene.children, true);

  if (sceneIntersects.length > 0) {
    const hitObject = sceneIntersects[0].object;
    console.log("Intersected scene object:", hitObject.name);

    const targetPosition = sceneIntersects[0].point; // Käytä osumapistettä
    console.log("Target position:", targetPosition);

    const weapon = scene.getObjectByName("weapon"); // Hae ladattu ase
    if (weapon) {
      animateWeaponToTarget(weapon, targetPosition); // Animoidaan ase kohteeseen
    } else {
      console.log("No weapon found to animate. Please select a weapon first.");
    }
    return;
  }
});

const animateWeaponToTarget = (weapon: Object3D, targetPosition: Vector3) => {
  if (isAnimating) return; // Estä uuden animaation käynnistäminen, jos animaatio on jo käynnissä
  isAnimating = true; // Aseta animaatio käynnissä -tila

  // Palauta X-akselin rotaatio nollapisteeseen
  weapon.rotation.set(0, 0, 0);

  // Irrota ase kamerasta animaation ajaksi
  camera.remove(weapon);
  scene.add(weapon);

  const initialPosition = weapon.position.clone(); // Tallenna alkuperäinen sijainti
  const initialRotation = weapon.rotation.clone(); // Tallenna alkuperäinen rotaatio

  let progress = 0; // Animaation eteneminen

  const animationLoop = () => {
    if (progress < 1) {
      progress += 0.02; // Nopeus
      weapon.position.lerpVectors(initialPosition, targetPosition, progress); // Liikuta asetta kohti kohdetta

      // Pyöritä asetta kärki edellä
      weapon.rotation.x = Math.PI * 2 * progress; // Pyörii X-akselin ympäri
    } else {
      // Kun ase osuu kohteeseen, piilota se
      weapon.visible = false;

      // Palauta ase alkuperäiseen paikkaan ja näkyväksi pienen viiveen jälkeen
      setTimeout(() => {
        weapon.position.copy(initialPosition);
        weapon.rotation.copy(initialRotation);
        weapon.visible = true;

        // Palauta ase kameran lapseksi
        scene.remove(weapon);
        camera.add(weapon);

        isAnimating = false; // Animaatio on päättynyt
      }, 500); // Viive ennen palautusta
      return;
    }
    requestAnimationFrame(animationLoop);
  };

  animationLoop();
};

const rotateWeaponIdle = (weapon: Object3D) => {
  const idleAnimationLoop = () => {
    if (!isAnimating) { // Pyöritä vain, jos animaatio ei ole käynnissä
      weapon.rotation.y += 0.02; // Pyöritä X-akselin ympäri
    }
    requestAnimationFrame(idleAnimationLoop);
  };

  idleAnimationLoop();
};

// Päivitä kamera, kun ikkunan koko muuttuu
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

const tempMatrix = new Matrix4();

// Luo reticle (kohdistin) osumapisteen näyttämiseen
const reticleGeometry = new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
const reticleMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
const reticle = new Mesh(reticleGeometry, reticleMaterial);
reticle.visible = false;
scene.add(reticle);

let isAnimating = false; // Tila, joka kertoo, onko animaatio käynnissä

const animate = () => {
  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) {
      if (!hitTestSourceAvailable) {
        initHitSource(); // Alusta hit-test-lähde, jos sitä ei ole
      }
      updateReticle(frame); // Päivitä reticle WebXR:n hit-test-tulosten perusteella
    }

    renderer.render(scene, camera); // Renderöi 3D-näkymä
    labelRenderer.render(scene, camera); // Renderöi CSS2D-elementit, kuten kello
  });
};
animate();

window.addEventListener("click", () => {
  if (isAnimating) {
    console.log("Animation in progress. Please wait.");
    return; // Estä kaikki toiminta, jos animaatio on käynnissä
  }

  // Tarkista, onko reticle näkyvissä
  if (!reticle.visible) {
    console.log("No valid hit-test target.");
    return;
  }

  // Jos klikataan muuta kohtaa kuin painikkeita
  console.log("No intersection");

  const targetPosition = reticle.position.clone(); // Käytä päivitettyä sijaintia
  console.log("Target position:", targetPosition);

  const weapon = scene.getObjectByName("weapon"); // Hae ladattu ase
  if (weapon) {
    animateWeaponToTarget(weapon, targetPosition); // Animoidaan ase kohteeseen
  } else {
    console.log("No weapon found to animate. Please select a weapon first.");
  }
});

const updateReticle = (frame: XRFrame) => {
  if (!hitTestSourceAvailable || !hitTestSource || !localReferenceSpace) return;

  const hitTestResults = frame.getHitTestResults(hitTestSource);

  if (hitTestResults.length > 0) {
    const hit = hitTestResults[0];
    const pose = hit.getPose(localReferenceSpace);

    if (pose) {
      // Päivitä reticle sijainti ja rotaatio hit-test-tuloksen perusteella
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);
      reticle.position.setFromMatrixPosition(reticle.matrix);

      // Päivitä reticle rotaatio
      const rotation = new Quaternion().setFromRotationMatrix(reticle.matrix);
      reticle.quaternion.copy(rotation);
    }
  } else {
    reticle.visible = false; // Piilota reticle, jos ei osumia
  }
};

// Luo kello-elementti
const clockDiv = document.createElement("div");
clockDiv.style.color = "white";
clockDiv.style.fontSize = "20px";
clockDiv.style.fontFamily = "Arial, sans-serif";
clockDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
clockDiv.style.padding = "5px 10px";
clockDiv.style.borderRadius = "5px";
clockDiv.innerText = "Alive: 0m 0s";

// Luo CSS2DObject kellolle
const clockLabel = new CSS2DObject(clockDiv);
clockLabel.position.set(-0.12, 0.4, -1); // Aseta kello suoraan kameran eteen
camera.add(clockLabel); // Lisää kello kameran lapseksi
scene.add(camera); // Varmista, että kamera on lisätty sceneen

// Luo scores-elementti
const scoresDiv = document.createElement("div");
scoresDiv.style.color = "white";
scoresDiv.style.fontSize = "20px";
scoresDiv.style.fontFamily = "Arial, sans-serif";
scoresDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
scoresDiv.style.padding = "5px 10px";
scoresDiv.style.borderRadius = "5px";
scoresDiv.innerText = "Score: 0";

// Luo CSS2DObject scoresille
const scoresLabel = new CSS2DObject(scoresDiv);
scoresLabel.position.set(0.12, 0.4, -1); // Aseta scores kameran eteen kellon alapuolelle
camera.add(scoresLabel); // Lisää scores kameran lapseksi

let score = 0; // Alustetaan pisteet

const updateScores = (newScore: number) => {
  score += newScore;
  scoresDiv.innerText = `Score: ${score}`;
};

// Esimerkki: Päivitä pisteet
setInterval(() => {
  updateScores(10); // Päivitä pisteet 10:een 5 sekunnin kuluttua
}, 5000);

// Päivitä kello reaaliajassa
let startTime = Date.now();

const updateClock = () => {
  const elapsedTime = Date.now() - startTime;
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  clockDiv.innerText = `Alive: ${minutes}m ${seconds}s`;
};

console.log(clockDiv); // Tarkista, että elementti on olemassa

// Päivitä kello 1 sekunnin välein
setInterval(updateClock, 1000);