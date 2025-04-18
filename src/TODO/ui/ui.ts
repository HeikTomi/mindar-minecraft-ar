import { loadModel } from "../loaders/modelLoader";

// Hakku-painike
const pickaxeButtonDiv = document.createElement("div");
pickaxeButtonDiv.style.width = "50px";
pickaxeButtonDiv.style.height = "50px";
pickaxeButtonDiv.style.backgroundImage = "url('./assets/mc_pickaxe_diamond.png')";
pickaxeButtonDiv.style.backgroundSize = "cover";
pickaxeButtonDiv.style.backgroundPosition = "center";
pickaxeButtonDiv.style.backgroundSize = "90%";
pickaxeButtonDiv.style.backgroundRepeat = "no-repeat";
pickaxeButtonDiv.style.border = "solid 5px black";
pickaxeButtonDiv.style.borderRadius = "5px";
pickaxeButtonDiv.style.cursor = "pointer";
pickaxeButtonDiv.style.position = "absolute";
pickaxeButtonDiv.style.bottom = "10px";
pickaxeButtonDiv.style.left = "10px";
pickaxeButtonDiv.onclick = () => {
  loadModel("./assets/Minecraft_pickaxe.glb");
};

// Miekka-painike
const swordButtonDiv = document.createElement("div");
swordButtonDiv.style.width = "50px";
swordButtonDiv.style.height = "50px";
swordButtonDiv.style.backgroundImage = "url('./assets/mc_sword_enchanted.jpeg')";
swordButtonDiv.style.backgroundSize = "cover";
swordButtonDiv.style.backgroundPosition = "center";
swordButtonDiv.style.backgroundSize = "90%";
swordButtonDiv.style.backgroundRepeat = "no-repeat";
swordButtonDiv.style.border = "solid 5px black";
swordButtonDiv.style.borderRadius = "5px";
swordButtonDiv.style.cursor = "pointer";
swordButtonDiv.style.position = "absolute";
swordButtonDiv.style.bottom = "10px";
swordButtonDiv.style.right = "10px";
swordButtonDiv.onclick = () => {
  loadModel("./assets/Minecraft_sword.glb");
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

// Lisää inventaario DOM:iin
document.body.appendChild(inventoryDiv);

export { pickaxeButtonDiv, swordButtonDiv, inventoryDiv };
