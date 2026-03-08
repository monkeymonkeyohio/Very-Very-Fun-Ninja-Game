/* ============================================================
   ENGINE.JS — MAIN GAME LOOP & RENDER PIPELINE
============================================================ */

import { loadAssets } from "./assets.js";
import { Player } from "./player.js";
import { World } from "./world.js";
import { FXSystem } from "./fx.js";
import { EnemyManager } from "./enemies.js";

/* ------------------------------------------------------------
   GLOBALS
------------------------------------------------------------ */
let assets = null;
let player = null;
let worldData = null;
let fxSystem = null;
let enemyManager = null;

let lastTime = 0;

/* ------------------------------------------------------------
   CANVAS SETUP
------------------------------------------------------------ */
const bgCanvas = document.getElementById("bg");
const worldCanvas = document.getElementById("world");
const fxCanvas = document.getElementById("fx");

const bgCtx = bgCanvas.getContext("2d");
const worldCtx = worldCanvas.getContext("2d");
const fxCtx = fxCanvas.getContext("2d");

const W = worldCanvas.width;
const H = worldCanvas.height;

/* ------------------------------------------------------------
   INPUT HANDLING
------------------------------------------------------------ */
const keys = new Set();

window.addEventListener("keydown", e => {
    keys.add(e.key.toLowerCase());
});

window.addEventListener("keyup", e => {
    keys.delete(e.key.toLowerCase());
});

/* ------------------------------------------------------------
   UPDATE
------------------------------------------------------------ */
function update(dt) {
    player.handleInput(keys);
    player.update(dt);

    enemyManager.update(dt, player);
    fxSystem.update(dt);
}

/* ------------------------------------------------------------
   RENDER
------------------------------------------------------------ */
function render() {
    // Clear canvases
    bgCtx.clearRect(0, 0, W, H);
    worldCtx.clearRect(0, 0, W, H);
    fxCtx.clearRect(0, 0, W, H);

    // Background
    worldData.renderBackground(bgCtx);

    // World geometry
    worldData.render(worldCtx);

    // Enemies
    enemyManager.render(worldCtx, assets);

    // Player (IMPORTANT: pass assets!)
    player.render(worldCtx, assets);

    // FX
    fxSystem.render(fxCtx, assets);
}

/* ------------------------------------------------------------
   MAIN LOOP
------------------------------------------------------------ */
function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(loop);
}

/* ------------------------------------------------------------
   START GAME
------------------------------------------------------------ */
async function start() {
    console.log("ENGINE 3/8/2026 VERSION LOADED (Assets Fix)");

    // Load assets FIRST
    assets = await loadAssets();

    // Create world + systems
    worldData = new World();
    fxSystem = new FXSystem();
    enemyManager = new EnemyManager(worldData, fxSystem);

    // Create player
    player = new Player(worldData, fxSystem);

    // Start loop
    requestAnimationFrame(loop);
}

start();
