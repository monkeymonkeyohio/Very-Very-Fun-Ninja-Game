/* ============================================================
   ENGINE.JS — CORE GAME LOGIC & RENDERING
   SHINOBI: LAST MAN STANDING — Protocol 1252
============================================================ */

/* ------------------------------------------------------------
   CANVAS SETUP
------------------------------------------------------------ */
const bg = document.getElementById("bg");
const world = document.getElementById("world");
const fx = document.getElementById("fx");

const bgCtx = bg.getContext("2d");
const worldCtx = world.getContext("2d");
const fxCtx = fx.getContext("2d");

let W = 1280;   // internal resolution
let H = 720;

/* Resize canvases to internal resolution */
function resizeCanvases() {
    [bg, world, fx].forEach(c => {
        c.width = W;
        c.height = H;
    });
}
resizeCanvases();

/* ------------------------------------------------------------
   GAME STATE
------------------------------------------------------------ */
let gameStarted = false;
let inArena = true;
let arenaIntroTimer = 0;
let arenaIntroDone = false;

let player = null;
let bot = null;

let parkour = null;

let camera = { x: 0, y: 0, zoom: 1 };

/* ------------------------------------------------------------
   PLAYER OBJECT
------------------------------------------------------------ */
class Player {
    constructor() {
        this.x = 200;
        this.y = 500;
        this.w = 60;
        this.h = 90;

        this.vx = 0;
        this.vy = 0;

        this.speed = 6;
        this.jumpPower = 16;
        this.gravity = 0.8;

        this.onGround = false;

        this.hp = 100;
        this.maxHP = 100;

        this.parryWindow = 0;
        this.parryCooldown = 0;

        this.attacking = false;
        this.attackTimer = 0;
    }

    update() {
        // Movement
        if (keys["ArrowLeft"]) this.vx = -this.speed;
        else if (keys["ArrowRight"]) this.vx = this.speed;
        else this.vx = 0;

        // Jump
        if (keys["ArrowUp"] && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }

        // Gravity
        this.vy += this.gravity;

        // Apply movement
        this.x += this.vx;
        this.y += this.vy;

        // Ground clamp (arena)
        if (inArena) {
            if (this.y + this.h > 650) {
                this.y = 650 - this.h;
                this.vy = 0;
                this.onGround = true;
            }
        }

        // Parry
        if (this.parryWindow > 0) this.parryWindow--;
        if (this.parryCooldown > 0) this.parryCooldown--;

        // Attack
        if (this.attacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) this.attacking = false;
        }
    }

    attack() {
        if (!this.attacking) {
            this.attacking = true;
            this.attackTimer = 12;
        }
    }

    parry() {
        if (this.parryCooldown === 0) {
            this.parryWindow = 12;
            this.parryCooldown = 40;
        }
    }
}

/* ------------------------------------------------------------
   BOT OBJECT
------------------------------------------------------------ */
class Bot {
    constructor() {
        this.x = 900;
        this.y = 500;
        this.w = 60;
        this.h = 90;

        this.vx = 0;
        this.vy = 0;

        this.speed = 4;
        this.gravity = 0.8;

        this.hp = 100;
        this.maxHP = 100;

        this.stunned = 0;
        this.attackCooldown = 0;
    }

    update() {
        if (this.stunned > 0) {
            this.stunned--;
            return;
        }

        // Move toward player
        if (player.x < this.x) this.vx = -this.speed;
        else this.vx = this.speed;

        this.x += this.vx;

        // Gravity
        this.vy += this.gravity;
        this.y += this.vy;

        // Ground clamp
        if (this.y + this.h > 650) {
            this.y = 650 - this.h;
            this.vy = 0;
        }

        // Attack
        if (this.attackCooldown > 0) this.attackCooldown--;
        else {
            if (Math.abs(this.x - player.x) < 90) {
                this.attackCooldown = 40;
                botAttack();
            }
        }
    }
}

/* ------------------------------------------------------------
   BOT ATTACK + PARRY CHECK
------------------------------------------------------------ */
function botAttack() {
    // Parry success
    if (player.parryWindow > 0) {
        bot.stunned = 40;
        bot.hp -= 20;

        // Flash effect
        fxCtx.fillStyle = "rgba(255,255,255,0.5)";
        fxCtx.fillRect(0, 0, W, H);
        return;
    }

    // Normal hit
    player.hp -= 10;
}

/* ------------------------------------------------------------
   SWORD ARC DRAW
------------------------------------------------------------ */
function drawSwordArc() {
    if (!player.attacking) return;

    worldCtx.strokeStyle = "rgba(255,255,255,0.8)";
    worldCtx.lineWidth = 6;

    worldCtx.beginPath();
    worldCtx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        80,
        Math.PI * 0.1,
        Math.PI * 0.9
    );
    worldCtx.stroke();
}

/* ------------------------------------------------------------
   CINEMATIC FINISHER
------------------------------------------------------------ */
let finisherActive = false;
let finisherTimer = 0;

function startFinisher() {
    finisherActive = true;
    finisherTimer = 90;
    camera.zoom = 1.6;
}

function updateFinisher() {
    if (!finisherActive) return;

    finisherTimer--;

    // Zoom out
    camera.zoom -= 0.007;

    // Slash flashes
    if (finisherTimer % 10 === 0) {
        fxCtx.fillStyle = "rgba(255,255,255,0.4)";
        fxCtx.fillRect(0, 0, W, H);
    }

    // End
    if (finisherTimer <= 0) {
        finisherActive = false;
        camera.zoom = 1;
        spawnPortal();
    }
}

/* ------------------------------------------------------------
   PORTAL SPAWN
------------------------------------------------------------ */
let portal = null;

function spawnPortal() {
    portal = { x: 600, y: 500, t: 0 };
}

/* ------------------------------------------------------------
   INPUT
------------------------------------------------------------ */
const keys = {};
document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (e.key === " " && gameStarted) player.attack();
    if (e.key === "f" && gameStarted) player.parry();
});
document.addEventListener("keyup", e => keys[e.key] = false);

/* ------------------------------------------------------------
   START GAME BUTTON
------------------------------------------------------------ */
document.getElementById("startButton").onclick = () => {
    document.getElementById("titleScreen").style.display = "none";

    document.getElementById("viewportContainer").classList.add("showGame");
    document.getElementById("hud").classList.add("showGame");

    startGame();
};

/* ------------------------------------------------------------
   START GAME
------------------------------------------------------------ */
function startGame() {
    gameStarted = true;

    player = new Player();
    bot = new Bot();

    arenaIntroTimer = 120; // 2 seconds at 60fps
    arenaIntroDone = false;

    requestAnimationFrame(gameLoop);
}

/* ------------------------------------------------------------
   ARENA INTRO
------------------------------------------------------------ */
function drawArenaIntro() {
    const t = arenaIntroTimer;

    // Fade from black
    const alpha = t / 120;
    bgCtx.fillStyle = `rgba(0,0,0,${alpha})`;
    bgCtx.fillRect(0, 0, W, H);

    // Spotlight
    bgCtx.fillStyle = "rgba(110,203,255,0.15)";
    bgCtx.beginPath();
    bgCtx.arc(W/2, H/2, 400, 0, Math.PI*2);
    bgCtx.fill();

    // Text flicker
    if (t < 90) {
        worldCtx.fillStyle = "rgba(110,203,255,0.8)";
        worldCtx.font = "28px Segoe UI";
        worldCtx.textAlign = "center";
        worldCtx.fillText("Protocol 1252 — Arena Sector", W/2, H/2 - 120);
    }
}

/* ------------------------------------------------------------
   GAME LOOP
------------------------------------------------------------ */
function gameLoop() {
    // Clear canvases
    bgCtx.clearRect(0, 0, W, H);
    worldCtx.clearRect(0, 0, W, H);
    fxCtx.clearRect(0, 0, W, H);

    // Arena intro
    if (!arenaIntroDone) {
        arenaIntroTimer--;
        drawArenaIntro();

        if (arenaIntroTimer <= 0) arenaIntroDone = true;

        requestAnimationFrame(gameLoop);
        return;
    }

    // Update
    player.update();
    bot.update();
    updateFinisher();

    // Bot death → finisher
    if (bot.hp <= 0 && !finisherActive) startFinisher();

    // Draw player
    worldCtx.fillStyle = "#6ecbff";
    worldCtx.fillRect(player.x, player.y, player.w, player.h);

    // Draw bot
    if (bot.hp > 0) {
        worldCtx.fillStyle = "#ff6e6e";
        worldCtx.fillRect(bot.x, bot.y, bot.w, bot.h);
    }

    // Sword arc
    drawSwordArc();

    // Portal
    if (portal) {
        portal.t++;
        worldCtx.fillStyle = `rgba(110,203,255,${0.5 + Math.sin(portal.t/10)*0.3})`;
        worldCtx.beginPath();
        worldCtx.arc(portal.x, portal.y, 50, 0, Math.PI*2);
        worldCtx.fill();
    }

    // HUD
    updateHUD();

    requestAnimationFrame(gameLoop);
}

/* ------------------------------------------------------------
   HUD UPDATE
------------------------------------------------------------ */
function updateHUD() {
    const php = document.getElementById("playerHP");
    const ehp = document.getElementById("enemyHP");

    php.style.width = (player.hp / player.maxHP * 300) + "px";
    ehp.style.width = (bot.hp / bot.maxHP * 260) + "px";
}
