/* ============================================================
   ENGINE.JS — MAIN LOOP & ORCHESTRATION (ES MODULE)
============================================================ */

console.log("ENGINE 3/8/2026 VERSION LOADED (player.js fix)");

import { loadAssets } from "./assets.js";
import { Player } from "./player.js";
import { CombatSystem } from "./combat.js";
import { AbilitySystem } from "./abilities.js";
import { EnemyManager } from "./enemies.js";
import { World } from "./world.js";
import { FXSystem } from "./fx.js";


/* ------------------------------------------------------------
   TITLE SCREEN → START BUTTON
------------------------------------------------------------ */
const titleScreen = document.getElementById("titleScreen");
const startButton = document.getElementById("startButton");

startButton.addEventListener("click", () => {
    titleScreen.style.display = "none";
});

/* ------------------------------------------------------------
   CANVAS SETUP
------------------------------------------------------------ */
const bg = document.getElementById("bg");
const world = document.getElementById("world");
const fx = document.getElementById("fx");

const bgCtx = bg.getContext("2d");
const worldCtx = world.getContext("2d");
const fxCtx = fx.getContext("2d");

let W = 1280;
let H = 720;

function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetRatio = 16 / 9;
    let w = vw;
    let h = vw / targetRatio;
    if (h > vh) {
        h = vh;
        w = vh * targetRatio;
    }
    [bg, world, fx].forEach(c => {
        c.width = W;
        c.height = H;
        c.style.width = w + "px";
        c.style.height = h + "px";
    });
}
window.addEventListener("resize", resize);
resize();

/* ------------------------------------------------------------
   INPUT
------------------------------------------------------------ */
const keys = new Set();

window.addEventListener("keydown", e => {
    keys.add(e.key.toLowerCase());
});

window.addEventListener("keyup", e => {
    keys.delete(e.key.toLowerCase());
});

/* ------------------------------------------------------------
   GAME OBJECTS
------------------------------------------------------------ */
const assets = await loadAssets();

const worldData = new World();
const fxSystem = new FXSystem(fxCtx);
const enemyManager = new EnemyManager(worldData, fxSystem);
const player = new Player(worldData, fxSystem);
const combat = new CombatSystem(player, enemyManager, fxSystem);
const abilities = new AbilitySystem(player, enemyManager, fxSystem);

/* ------------------------------------------------------------
   MAIN LOOP
------------------------------------------------------------ */
let lastTime = performance.now();

function update(dt) {
    // Input → Player
    player.handleInput(keys);
    player.update(dt);

    // Combat & abilities
    combat.update(dt, keys);
    abilities.update(dt, keys);

    // Enemies
    enemyManager.update(dt, player);

    // World
    worldData.update(dt);

    // FX
    fxSystem.update(dt);
}

function render() {
    // Clear
    bgCtx.clearRect(0, 0, W, H);
    worldCtx.clearRect(0, 0, W, H);
    fxCtx.clearRect(0, 0, W, H);

    // Background
    worldData.renderBackground(bgCtx);

    // World & platforms
    worldData.render(worldCtx);

    // Enemies
    enemyManager.render(worldCtx);

    // Player
    player.render(worldCtx);

    // FX
    fxSystem.render(fxCtx);
}

function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;

    update(dt);
    render();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
