// Tuo Three.js-moduulit
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Raycaster, Vector2, MeshBasicMaterial, Mesh, Object3D, Vector3, RingGeometry, Quaternion, Box3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

// Tila, joka kertoo, onko animaatio käynnissä
let isAnimating = false;

// Luo hit-test-lähde WebXR:ssä
let hitTestSourceAvailable = false;
let hitTestSource: XRHitTestSource | null = null;
let localReferenceSpace: XRReferenceSpace | null = null;

/* SCENE, CAMERA, LIGHTS, RENDERER, CSS2DRENDERER */

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

// Lisää kamera sceneen, jotta painikkeet näkyvät
scene.add(camera);

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

// Luo 3D-mallin lataaja
const loader = new GLTFLoader();

/* UI ELEMENTS */

// Luo alkunäyttöelementti
const coverScreen = document.createElement("div");
coverScreen.id = "coverScreen"; // Aseta ID, jotta elementti voidaan helposti löytää
coverScreen.style.position = "fixed";
coverScreen.style.top = "0";
coverScreen.style.left = "0";
coverScreen.style.width = "100%";
coverScreen.style.height = "100%";
coverScreen.style.backgroundImage = "url('./assets/cover.png')"; // Aseta taustakuva
coverScreen.style.backgroundSize = "cover"; // Skaalaa kuva täyttämään koko näyttö
coverScreen.style.backgroundPosition = "center";
coverScreen.style.zIndex = "1";
coverScreen.style.display = "flex";
coverScreen.style.justifyContent = "center";
coverScreen.style.alignItems = "center";
coverScreen.style.color = "white";
coverScreen.style.fontSize = "2em";
coverScreen.style.fontFamily = "sans-serif";
coverScreen.style.cursor = "pointer";

// Lisää alkunäyttöelementti bodyyn
document.body.appendChild(coverScreen);

// Lisää WebXR-painike DOM Overlay -tuella
document.body.appendChild(
  ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test", "dom-overlay"],
    domOverlay: { root: document.body }, // Aseta HTML-elementtien juuri
  })
);

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
// Aseta painikkeen sijainti CSS:llä
pickaxeButtonDiv.style.position = "absolute";
pickaxeButtonDiv.style.bottom = "10px"; // Sijoita ruudun alareunaan
pickaxeButtonDiv.style.left = "10px"; // Sijoita vasempaan reunaan
pickaxeButtonDiv.onclick = () => {
  if(isAnimating) return; // Estä lataus, jos animaatio on käynnissä
  // Poista vanha ase, jos sellainen on
  const oldWeapon = camera.getObjectByName("weapon");
  if (oldWeapon) {
    camera.remove(oldWeapon);
  }
  // Lataa uusi ase
  console.log("Pickaxe selected");
  loadModel("./assets/Minecraft_pickaxe.glb");
};

// Lisää hakku-painike DOM:iin
document.body.appendChild(pickaxeButtonDiv);

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
// Aseta painikkeen sijainti CSS:llä
swordButtonDiv.style.position = "absolute";
swordButtonDiv.style.bottom = "10px"; // Sijoita ruudun alareunaan
swordButtonDiv.style.right = "10px"; // Sijoita vasempaan reunaan
swordButtonDiv.onclick = () => {
  if(isAnimating) return; // Estä lataus, jos animaatio on käynnissä
  const oldWeapon = camera.getObjectByName("weapon");
  if (oldWeapon) {
    camera.remove(oldWeapon);
  }
  // Lataa uusi ase
  console.log("Sword selected");
  loadModel("./assets/Minecraft_sword.glb");
};

// Lisää hakku-painike DOM:iin
document.body.appendChild(swordButtonDiv);

// Funktio 3D-mallin (aseen ja hakun) lataamiseen
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
      weapon.userData.assetPath = modelPath; // Tallenna tiedostopolku tunnisteeksi
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

// Luo kello-elementti
const clockDiv = document.createElement("div");
clockDiv.style.position = "absolute";
clockDiv.style.top = "10px";
clockDiv.style.right = "10px";
clockDiv.style.color = "white";
clockDiv.style.fontSize = "20px";
clockDiv.style.fontFamily = "Arial, sans-serif";
clockDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
clockDiv.style.padding = "5px 10px";
clockDiv.style.borderRadius = "5px";
clockDiv.style.zIndex = "1000"; // Näytä UI muiden elementtien päällä
clockDiv.innerText = "Alive: 0m 0s";

// Lisää kello DOM:iin
document.body.appendChild(clockDiv);

// Luo scores-elementti
const scoresDiv = document.createElement("div");
scoresDiv.style.position = "absolute";
scoresDiv.style.top = "50px";
scoresDiv.style.right = "10px";
scoresDiv.style.color = "white";
scoresDiv.style.fontSize = "20px";
scoresDiv.style.fontFamily = "Arial, sans-serif";
scoresDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
scoresDiv.style.padding = "5px 10px";
scoresDiv.style.borderRadius = "5px";
scoresDiv.style.zIndex = "1000"; // Näytä UI muiden elementtien päällä
scoresDiv.innerText = "Score: 0";

// Lisää pisteet DOM:iin
document.body.appendChild(scoresDiv);

let score = 0; // Alustetaan pisteet

const updateScores = (newScore: number) => {
  score += newScore;
  scoresDiv.innerText = `Score: ${score}`;
};

// Päivitä kello reaaliajassa
let startTime = Date.now();
const updateClock = () => {
  const elapsedTime = Date.now() - startTime;
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  clockDiv.innerText = `Alive: ${minutes}m ${seconds}s`;
};

// Luo elämät-elementti
const livesDiv = document.createElement("div");
livesDiv.style.position = "absolute";
livesDiv.style.top = "10px";
livesDiv.style.left = "10px";
livesDiv.style.display = "flex";
livesDiv.style.gap = "5px"; // Väli sydänten välillä
livesDiv.style.zIndex = "1000"; // Näytä UI muiden elementtien päällä

// Lisää 4 sydäntä
const maxLives = 4;
let currentLives = maxLives;

for (let i = 0; i < maxLives; i++) {
  const heart = document.createElement("img");
  heart.src = "./assets/heart.png"; // Sydänkuvan polku
  heart.style.width = "30px"; // Sydämen leveys
  heart.style.height = "30px"; // Sydämen korkeus
  livesDiv.appendChild(heart);
}

// Lisää elämät DOM:iin
document.body.appendChild(livesDiv);

const updateLivesUI = () => {
  const hearts = livesDiv.querySelectorAll("img");
  hearts.forEach((heart, index) => {
    if (index < currentLives) {
      heart.style.opacity = "1"; // Näytä sydän
    } else {
      heart.style.opacity = "0.3"; // Himmennä sydän
    }
  });
};

// Luo inventaario-elementti
const inventoryDiv = document.createElement("div");
inventoryDiv.style.position = "absolute";
inventoryDiv.style.top = "50%"; // Keskelle pystysuunnassa
inventoryDiv.style.right = "10px"; // Näytön oikeaan reunaan
inventoryDiv.style.transform = "translateY(-50%)"; // Keskitys pystysuunnassa
inventoryDiv.style.display = "flex";
inventoryDiv.style.flexDirection = "column"; // Järjestä blokit pystysuoraan
inventoryDiv.style.gap = "10px"; // Väli blokkien välillä
inventoryDiv.style.zIndex = "1000"; // Näytä UI muiden elementtien päällä

// Blokkien tiedot
const blocks = [
  { name: "beige", imagePath: "./assets/minecraft_blocks_beige.png", modelPath: "./assets/minecraft_blocks_beige.glb", count: 1 },
  { name: "brown", imagePath: "./assets/minecraft_blocks_brown.png", modelPath: "./assets/minecraft_blocks_brown.glb", count: 1 },
  { name: "green", imagePath: "./assets/minecraft_blocks_green.png", modelPath: "./assets/minecraft_blocks_green.glb", count: 1 },
  { name: "grey", imagePath: "./assets/minecraft_blocks_grey.png", modelPath: "./assets/minecraft_blocks_grey.glb", count: 1 },
];

// Luo blokit inventaarioon
blocks.forEach((block) => {
  const blockDiv = document.createElement("div");
  blockDiv.classList.add("inventory-item"); // Lisää luokka
  blockDiv.dataset.blockName = block.name; // Lisää data-attribuutti
  blockDiv.style.display = "flex";
  blockDiv.style.flexDirection = "column";
  blockDiv.style.alignItems = "center";
  blockDiv.style.cursor = "pointer";

  // Blokin kuva tekstuuri
  const blockModelDiv = document.createElement("div");
  blockModelDiv.style.width = "50px";
  blockModelDiv.style.height = "50px";
  blockModelDiv.style.backgroundImage = `url('${block.imagePath}')`; // Esikatselukuva
  blockModelDiv.style.backgroundSize = "cover";
  blockModelDiv.style.border = "1px solid black";
  blockModelDiv.style.borderRadius = "5px";
  blockDiv.appendChild(blockModelDiv);

  // Blokin määrä
  const blockCount = document.createElement("span");
  blockCount.classList.add("block-count"); // Lisää luokka
  blockCount.innerText = `${block.count}`; // Näytä blokin määrä
  blockCount.style.position = "relative";
  blockCount.style.top = "30px";
  blockCount.style.left = "35px";
  blockCount.style.color = "white";
  blockCount.style.fontSize = "14px";
  blockCount.style.fontWeight = "bold";
  blockCount.style.textShadow = "0 0 5px black"; // Lisää kontrastia
  blockModelDiv.appendChild(blockCount);

  // Lisää klikkaustoiminnallisuus
  blockDiv.onclick = () => {
    if (block.count > 0 && reticle.visible) { // Tarkista, että blokkeja on ja reticle on näkyvissä
      console.log(`Clicked on block: ${block.name}`);
      // Lataa blokki ja aseta se rectilen sijaintiin
      loader.load(
        block.modelPath,
        (gltf) => {
          const blockObject = gltf.scene;
          blockObject.name = "block";
          blockObject.scale.set(0.7, 0.7, 0.7); // Skaalaa blokki sopivaksi

          // Laske blokin korkeus dynaamisesti
          const boundingBox = new Box3().setFromObject(blockObject);
          const blockHeight = boundingBox.max.y - boundingBox.min.y;

          // Tarkista, onko rectilen sijainnissa jo blokki
          let highestY = reticle.position.y; // Alkuarvo on rectilen korkeus
          scene.traverse((object) => {
            if (object.name === "block") {
              // Lasketaan vain vaakasuora etäisyys (x ja z)
              const horizontalDistance = Math.sqrt(
                Math.pow(object.position.x - reticle.position.x, 2) +
                Math.pow(object.position.z - reticle.position.z, 2)
              );
              if (horizontalDistance < 0.2) { // Jos blokki on tarpeeksi lähellä rectilen sijaintia
                highestY = Math.max(highestY, object.position.y + blockHeight); // Aseta uusi korkeus edellisen blokin päälle
              }
            }
          });

          // Aseta blokki rectilen sijaintiin tai edellisen päälle
          blockObject.position.set(reticle.position.x, highestY, reticle.position.z);
          scene.add(blockObject);

          updateScores(25); // Lisää pisteitä, kun blokki asetetaan
          console.log(`Placed block: ${block.name} at reticle position.`);
        },
        undefined,
        (error) => {
          console.error("Error loading block model:", error);
        }
      );

      // Vähennä inventaariosta
      block.count--;
      blockCount.innerText = `${block.count}`;
    } else if (!reticle.visible) {
      console.log("Reticle is not visible. Cannot place block.");
    } else {
      console.log(`No ${block.name} blocks left in inventory.`);
    }
  };

  inventoryDiv.appendChild(blockDiv);
});

// Lisää inventaario DOM:iin
document.body.appendChild(inventoryDiv);

// Piilota UI-elementit aluksi
inventoryDiv.style.display = "none";
clockDiv.style.display = "none";
scoresDiv.style.display = "none";
livesDiv.style.display = "none";

let clockInterval: ReturnType<typeof setInterval> | null = null;
let scoreInterval: ReturnType<typeof setInterval> | null = null;

// Lisää WebXR-istunnon aloituskuuntelija
renderer.xr.addEventListener("sessionstart", () => {
  console.log("WebXR session started");

  // Piilota alkunäyttöelementti
  coverScreen.style.display = "none";

  // Näytä UI-elementit
  inventoryDiv.style.display = "flex";
  clockDiv.style.display = "block";
  scoresDiv.style.display = "block";
  livesDiv.style.display = "flex";

  // Käynnistä kellon ja pisteiden päivitys
  startTime = Date.now();
  clockInterval = setInterval(updateClock, 1000);
  scoreInterval = setInterval(() => {
    updateScores(10);
  }, 5000);
});

// Lisää WebXR-istunnon lopetuskuuntelija
renderer.xr.addEventListener("sessionend", () => {
  console.log("WebXR session ended");

  // Näytä alkunäyttöelementti
  coverScreen.style.display = "flex";

  // Piilota UI-elementit
  inventoryDiv.style.display = "none";
  clockDiv.style.display = "none";
  scoresDiv.style.display = "none";
  livesDiv.style.display = "none";

  // Pysäytä kellon ja pisteiden päivitys
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
  if (scoreInterval) {
    clearInterval(scoreInterval);
    scoreInterval = null;
  }
});

// Lisää tapahtumakäsittelijät 3D-painikkeille
const raycaster = new Raycaster();

// Päivitä tapahtumakäsittelijä
window.addEventListener("click", (event) => {
  if (isAnimating) {
    console.log("Animation in progress. Please wait.");
    return; // Estä kaikki toiminta, jos animaatio on käynnissä
  }

  // Tarkista, osuuko klikkaus nappuloihin
  if (event.target === pickaxeButtonDiv || event.target === swordButtonDiv) {
    console.log("Button clicked. Ignoring scene interaction.");
    return; // Älä jatka, jos klikkaus osui nappuloihin
  }

  // Tarkista, osuuko klikkaus inventaarioelementteihin
  let clickedInventoryItem = false;
  let element = event.target as HTMLElement;
  while (element) {
    if (element.classList && element.classList.contains("inventory-item")) {
      clickedInventoryItem = true;
      break;
    }
    element = element.parentNode as HTMLElement;
  }

  if (clickedInventoryItem) {
    console.log("Clicked on inventory item. Ignoring scene interaction.");
    return; // Älä jatka, jos klikkaus osui inventaarioelementtiin
  }

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new Vector2();

  // Muunna kosketuskoordinaatit Three.js:n koordinaatistoon
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

    let targetPosition = new Vector3(); // Alustetaan targetPosition

    // Tarkista osumat sceneen lisättyihin objekteihin
    const sceneIntersects = raycaster.intersectObjects(scene.children, true);

    if (sceneIntersects.length > 0) {
      const hitObject = sceneIntersects[0].object;
      console.log("Intersected scene object:", hitObject.name);

      targetPosition = sceneIntersects[0].point; // Käytä osumapistettä
      console.log("Target position:", targetPosition);
    } else 
    {
      targetPosition.setFromMatrixPosition(reticle.matrix); // Käytä reticlen sijaintia
    }

    const weapon = scene.getObjectByName("weapon"); // Hae ladattu ase
    if (weapon) {
      animateWeaponToTarget(weapon, targetPosition); // Animoidaan ase kohteeseen
    } else {
      console.log("No weapon found to animate. Please select a weapon first.");
    }
    return;
});

/* ANIMATIONS */  

// Aseen heitto kohteeseen
const animateWeaponToTarget = (weapon: Object3D, targetPosition: Vector3) => {
  if (isAnimating) return;
  isAnimating = true;

  weapon.rotation.set(0, 0, 0);
  camera.remove(weapon);
  scene.add(weapon);

  const initialPosition = weapon.position.clone();
  const initialRotation = weapon.rotation.clone();

  let progress = 0;

  const animationLoop = () => {
    if (progress < 1) {
      progress += 0.03; // Animaation nopeus
      weapon.position.lerpVectors(initialPosition, targetPosition, progress);

      // Pyöritä asetta animaation aikana
      weapon.rotation.x += 0.2; // Pyörii X-akselin ympäri
      weapon.rotation.y += 0.1; // Pyörii Y-akselin ympäri
    } else {
      // Tarkista, osuuko ase monsteriin
      let hitSomething = false;
      const raycaster = new Raycaster();
      raycaster.set(weapon.position, targetPosition.clone().sub(weapon.position).normalize());
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const intersect of intersects) {
        const monster = intersect.object.parent; // Monsteri on parent-objekti
        if (monster && monster.name.startsWith("monster_")) {
          hitSomething = true;
          const damage = weapon && weapon.userData.assetPath.includes("pickaxe") ? 1 : 4; // Hakku tekee 1 vahinkoa, miekka 4
          monster.userData.health -= damage;

          // Päivitä health bar
          const maxHealth = 4; // Monsterin maksimiterveys
          const healthPercentage = Math.max(0, (monster.userData.health / maxHealth) * 100);
          monster.userData.healthBarGreen.style.width = `${healthPercentage}%`;

          if (monster.userData.health <= 0) {
            console.log(`Monster ${monster.name} defeated!`);
             
            // Poista health bar ennen monsterin poistamista
             const healthBarLabel = monster.children.find((child) => child instanceof CSS2DObject);
             if (healthBarLabel) {
               monster.remove(healthBarLabel); // Poista health bar monsterin lapsista
             }

            scene.remove(monster); // Poista monsteri, jos health on 0

            updateScores(50); // Lisää pisteitä, kun monsteri tuhotaan
            console.log(`Score updated: ${score}`);
          }
          break;
        }

        if (intersect.object.name === "block") {
          hitSomething = true;
          console.log("Hit a block. No new block will be found.");
          break;
        }
      }

      // Jos ei osuttu monsteriin tai blokkiin, tarkista mahdollisuus löytää uusi blokki
      if (!hitSomething && weapon.userData.assetPath.includes("pickaxe")) {
        console.log("Hit an empty spot. Checking for new block...");
        if (Math.random() < 0.5) { // 50% mahdollisuus löytää uusi blokki
          console.log("Found a new block!");

          // Valitse satunnainen blokki
          const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];

          // Luo pyörivä blokki
          loader.load(randomBlock.modelPath, (gltf) => {
            const spinningBlock = gltf.scene;
            spinningBlock.name = "spinningBlock";
            spinningBlock.scale.set(0.7, 0.7, 0.7);
            spinningBlock.position.copy(targetPosition); // Aseta blokki osumakohtaan
            scene.add(spinningBlock);

            // Animaatio: pyöritä blokkia
            const spinAnimation = () => {
              spinningBlock.rotation.y += 0.05;
              if (spinningBlock.userData.remove) {
                scene.remove(spinningBlock);
                return; // Lopeta animaatio
              }
              requestAnimationFrame(spinAnimation);
            };
            spinAnimation();

            // Lisää blokki inventaarioon ja poista se scenestä
            setTimeout(() => {
              randomBlock.count++;
              // Etsi inventaarioelementti ja päivitä sen määrä
              const blockDiv = inventoryDiv.querySelector(`.inventory-item[data-block-name="${randomBlock.name}"]`);
              if (blockDiv) {
                const blockCountElement = blockDiv.querySelector(".block-count") as HTMLElement;
                if (blockCountElement) {
                  blockCountElement.innerText = `${randomBlock.count}`;
                }
              }
              spinningBlock.userData.remove = true; // Merkitse poistettavaksi
              console.log(`Added ${randomBlock.name} to inventory.`);
            }, 2000); // 2 sekunnin viive ennen poistamista
          });
        } else {
          console.log("No block found.");
        }
      }

      weapon.visible = false;

      setTimeout(() => {
        weapon.position.copy(initialPosition);
        weapon.rotation.copy(initialRotation);
        weapon.visible = true;
        scene.remove(weapon);
        camera.add(weapon);
        isAnimating = false;
      }, 500);
      return;
    }
    requestAnimationFrame(animationLoop);
  };

  animationLoop();
};

// Pyöritä valittua asetta paikoillaan "idle"-animaatio
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

// Luo reticle (kohdistin) osumapisteen näyttämiseen
const reticleGeometry = new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
const reticleMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
const reticle = new Mesh(reticleGeometry, reticleMaterial);
reticle.visible = false;
scene.add(reticle);

const animate = () => {
  renderer.setAnimationLoop((_, frame) => {
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

/* MONSTERS */

const monsterModels = [
  "./assets/Minecraft_Pigman.glb",
  "./assets/Minecraft_Zombie.glb",
  "./assets/Minecraft_Skeleton.glb",
];

const addRandomMonster = (hitPoint: Vector3) => {
  let isOccupied = false;
  scene.traverse((object) => {
    if (object.name.startsWith("monster_")) {
      const distance = object.position.distanceTo(hitPoint);
      if (distance < 1) {
        isOccupied = true;
      }
    }
  });

  if (isOccupied) {
    console.log("Monster spawn location is already occupied.");
    return;
  }

  const randomModel = monsterModels[Math.floor(Math.random() * monsterModels.length)];

  loader.load(
    randomModel,
    (gltf) => {
      const monster = gltf.scene;
      monster.name = `monster_${Date.now()}`;
      monster.scale.set(0.5, 0.5, 0.5); // Skaalaa monsteri sopivaksi

      // Laske monsterin korkeus
      const boundingBox = new Box3().setFromObject(monster);
      const monsterHeight = boundingBox.max.y - boundingBox.min.y;

      // Aseta monsterin jalat osumaan hitPointiin
      monster.position.copy(hitPoint);
      monster.position.y += monsterHeight / 2; // Nosta monsteria niin, että jalat osuvat maahan

      scene.add(monster);

      // Lisää health bar
      const healthBarDiv = document.createElement("div");
      healthBarDiv.style.position = "absolute";
      healthBarDiv.style.width = "40px";
      healthBarDiv.style.height = "10px";
      healthBarDiv.style.backgroundColor = "red";
      healthBarDiv.style.border = "1px solid black";
      healthBarDiv.style.overflow = "hidden";

      const healthBarGreen = document.createElement("div");
      healthBarGreen.style.width = "100%";
      healthBarGreen.style.height = "100%";
      healthBarGreen.style.backgroundColor = "green";
      healthBarDiv.appendChild(healthBarGreen);

      const healthBarLabel = new CSS2DObject(healthBarDiv);
      const healthBarOffset = monsterHeight * 0.05; // Sijoita hieman pään yläpuolelle
      healthBarLabel.position.set(0, monsterHeight + healthBarOffset - monsterHeight / 2, 0); // Aseta health bar monsterin pään yläpuolelle
      monster.add(healthBarLabel);

      // Lisää health barin tiedot monsterin käyttäjätietoihin
      monster.userData.health = 4; // Alkuperäinen health
      monster.userData.healthBarGreen = healthBarGreen;

      console.log(`Added monster: ${monster.name} at (${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z})`);
    },
    undefined,
    (error) => {
      console.error("Error loading monster model:", error);
    }
  );
};

const spawnRandomMonster = () => {
  // Aseta seuraava monsterin ilmestyminen satunnaisen ajan kuluttua (10–30 sekuntia)
  const randomTime = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
  setTimeout(spawnRandomMonster, randomTime);

  if (!reticle.visible) {
    console.log("Reticle is not visible. Cannot spawn monster.");
    return; // Lopeta vain tämän kerran suoritus, mutta intervalli jatkuu
  }

  // Käytä rectilen sijaintia monsterin spawnaukseen
  const hitPoint = reticle.position.clone();
  addRandomMonster(hitPoint);
};

// Käynnistä monsterin spawnauksen intervalli
spawnRandomMonster(); 

const animateMonsters = () => {
  scene.traverse((object) => {
    if (object.name.startsWith("monster_")) {
      // Monsteri katsoo aina kameraa
      object.lookAt(camera.position);

      // Tarkista, hyökkääkö monsteri
      if (!object.userData.isAttacking && Math.random() < 0.0025) { // 0.25% mahdollisuus hyökkäykseen jokaisella framella
        startMonsterAttack(object);
      }
    }
  });

  requestAnimationFrame(animateMonsters);
};
animateMonsters();

const startMonsterAttack = (monster: Object3D) => {
  monster.userData.isAttacking = true; // Merkitse monsteri hyökkääväksi

  const initialPosition = monster.position.clone(); // Tallenna alkuperäinen sijainti
  const attackPosition = camera.position.clone(); // Hyökkäyksen kohde on kameran sijainti
  attackPosition.y = 0; // Pidä hyökkäys lattian tasolla

  let progress = 0;

  const attackAnimation = () => {
    if (progress < 1) {
      progress += 0.04; // Hyökkäyksen nopeus
      monster.position.lerpVectors(initialPosition, attackPosition, progress);
    } else {
      // Osuma kameraan
      flashScreenRed(); // Väläytä ruutu punaiseksi

      // Palauta monsteri alkuperäiseen sijaintiin
      setTimeout(() => {
        monster.position.copy(initialPosition);
        monster.userData.isAttacking = false; // Hyökkäys päättyy
      }, 500); // Viive ennen palautusta
      return;
    }
    requestAnimationFrame(attackAnimation);
  };

  attackAnimation();
};

// Tämä funktio väläyttää ruudun punaiseksi, kun monsteri osuu pelaajaan
// Se vähentää myös pelaajan elämää ja tarkistaa, loppuivatko elämät
const flashScreenRed = () => {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
  overlay.style.zIndex = "9999";
  document.body.appendChild(overlay);

  setTimeout(() => {
    document.body.removeChild(overlay); // Poista punainen välähdys
  }, 200); // Välähdyksen kesto

  // Vähennä elämää
  if (currentLives > 0) {
    currentLives--;
    updateLivesUI();
  }

  // Tarkista, loppuivatko elämät
  if (currentLives <= 0) {
    console.log("Game Over!");
    stopGame(); // Lopeta peli
  }
};

const stopGame = () => {
  // Pysäytä animaatiot
  renderer.setAnimationLoop(null); // Lopeta WebXR:n animaatiolooppi

  // Poistetaan monsterit ja niiden health barit
  scene.traverse((object) => {
    if (object.name.startsWith("monster_")) {
      // Poista health bar, jos sellainen on
      const healthBarLabel = object.children.find((child) => child instanceof CSS2DObject);
      if (healthBarLabel) {
        object.remove(healthBarLabel); // Poista health bar monsterin lapsista
      }

      scene.remove(object); // Poista monsteri scenestä
    }
  });

  // Pysäytä kellon ja pisteiden päivitys
  if (clockInterval !== null) {
    clearInterval(clockInterval);
  }
  if (scoreInterval !== null) {
    clearInterval(scoreInterval);
  }

  console.log("All animations and updates stopped.");

  // Luo "Game Over" -elementti
  const gameOverDiv = document.createElement("div");
  gameOverDiv.style.position = "fixed";
  gameOverDiv.style.top = "50%";
  gameOverDiv.style.left = "50%";
  gameOverDiv.style.transform = "translate(-50%, -50%)";
  gameOverDiv.style.color = "white";
  gameOverDiv.style.fontSize = "30px";
  gameOverDiv.style.fontFamily = "Arial, sans-serif";
  gameOverDiv.style.textAlign = "center";
  gameOverDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  gameOverDiv.style.padding = "20px";
  gameOverDiv.style.borderRadius = "10px";
  gameOverDiv.style.zIndex = "10000"; // Näytä muiden elementtien päällä

  // Lisää "Game Over" -teksti
  const gameOverText = document.createElement("div");
  gameOverText.innerText = "Game Over";
  gameOverDiv.appendChild(gameOverText);

  // Näytä pisteet
  const scoreText = document.createElement("div");
  scoreText.innerText = `Your Score: ${score}`;
  scoreText.style.marginTop = "10px";
  gameOverDiv.appendChild(scoreText);

  // Luo restart-painike
  const restartButton = document.createElement("button");
  restartButton.innerText = "Restart";
  restartButton.style.marginTop = "20px";
  restartButton.style.padding = "10px 20px";
  restartButton.style.fontSize = "20px";
  restartButton.style.cursor = "pointer";
  restartButton.style.border = "none";
  restartButton.style.borderRadius = "5px";
  restartButton.style.backgroundColor = "#28a745";
  restartButton.style.color = "white";

  // Lisää restart-painikkeen toiminnallisuus
  restartButton.onclick = () => {
    window.location.reload(); // Lataa sivu uudelleen
  };

  gameOverDiv.appendChild(restartButton);

  // Lisää "Game Over" -elementti DOM:iin
  document.body.appendChild(gameOverDiv);
};