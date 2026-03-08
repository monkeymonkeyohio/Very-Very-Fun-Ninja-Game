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

let W = 1280;
let H = 720;

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
let arenaIntroTimer = 120;
let arenaIntroDone = false;

let player = null;
let bot = null;

let camera = { x: 0, y: 0, zoom: 1 };

let shurikens = [];
let laser = null;

let screenShake = 0;

/* ------------------------------------------------------------
   INPUT
------------------------------------------------------------ */
const keys = {};
document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (!gameStarted || !arenaIntroDone) return;

    if (e.key === " ") player.attack();
    if (e.key === "f") player.parry();
    if (e.key === "q") player.shootShuriken();
    if (e.key === "e") player.castLaser();
});
document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

/* ------------------------------------------------------------
   PLAYER
------------------------------------------------------------ */
class Player {
    constructor() {
        this.x = 300;
        this.y = 500;
        this.w = 60;
        this.h = 90;

        this.vx = 0;
        this.vy = 0;

        this.speed = 7;
        this.jumpPower = 17;
        this.gravity = 0.9;

        this.onGround = false;

        this.hp = 100;
        this.maxHP = 100;

        this.facing = 1; // 1 = right, -1 = left

        this.parryWindow = 0;
        this.parryCooldown = 0;

        this.attacking = false;
        this.attackTimer = 0;

        this.chakra = 0;
        this.maxChakra = 100;
        this.chakraRegenBase = 0.12;
        this.chakraRegenMove = 0.06;
        this.chakraRegenAttack = 0.3;

        this.shurikenCooldown = 0;
        this.laserCooldown = 0;
        this.laserLock = false;

        this.swordTrail = [];
        this.scarf = this.initScarf();
    }

    initScarf() {
        const points = [];
        for (let i = 0; i < 8; i++) {
            points.push({
                x: this.x,
                y: this.y + 20,
                vx: 0,
                vy: 0
            });
        }
        return points;
    }

    updateScarf() {
        const headX = this.x + (this.facing === 1 ? -10 : this.w + 10);
        const headY = this.y + 20;

        const stiffness = 0.2;
        const damping = 0.85;

        this.scarf[0].x += (headX - this.scarf[0].x) * stiffness;
        this.scarf[0].y += (headY - this.scarf[0].y) * stiffness;

        for (let i = 1; i < this.scarf.length; i++) {
            const prev = this.scarf[i - 1];
            const p = this.scarf[i];

            const dx = prev.x - p.x;
            const dy = prev.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = 14;

            const diff = (dist - targetDist) / dist;

            p.x += dx * diff * 0.5;
            p.y += dy * diff * 0.5;

            p.vx *= damping;
            p.vy *= damping;
            p.x += p.vx;
            p.y += p.vy;
        }
    }

    addSwordTrail() {
        this.swordTrail.push({
            x: this.x + this.w / 2,
            y: this.y + this.h / 2,
            facing: this.facing,
            life: 14
        });
    }

    updateSwordTrail() {
        this.swordTrail.forEach(t => t.life--);
        this.swordTrail = this.swordTrail.filter(t => t.life > 0);
    }

    regenChakra(baseBoost = 0) {
        if (this.laserLock) return;
        let amount = this.chakraRegenBase + baseBoost;
        if (Math.abs(this.vx) > 0.1) amount += this.chakraRegenMove;
        this.chakra = Math.min(this.maxChakra, this.chakra + amount);
    }

    update() {
        // Movement
        if (keys["ArrowLeft"]) {
            this.vx = -this.speed;
            this.facing = -1;
        } else if (keys["ArrowRight"]) {
            this.vx = this.speed;
            this.facing = 1;
        } else {
            this.vx = 0;
        }

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

        // Ground clamp
        if (this.y + this.h > 650) {
            this.y = 650 - this.h;
            this.vy = 0;
            this.onGround = true;
        }

        // Parry
        if (this.parryWindow > 0) this.parryWindow--;
        if (this.parryCooldown > 0) this.parryCooldown--;

        // Attack
        if (this.attacking) {
            this.attackTimer--;
            if (this.attackTimer === 10) this.addSwordTrail();
            if (this.attackTimer <= 0) this.attacking = false;
        }

        // Cooldowns
        if (this.shurikenCooldown > 0) this.shurikenCooldown--;
        if (this.laserCooldown > 0) this.laserCooldown--;

        // Chakra
        this.regenChakra();

        // Scarf + trail
        this.updateScarf();
        this.updateSwordTrail();
    }

    attack() {
        if (!this.attacking && !this.laserLock) {
            this.attacking = true;
            this.attackTimer = 14;
            this.regenChakra(this.chakraRegenAttack);
        }
    }

    parry() {
        if (this.parryCooldown === 0 && !this.laserLock) {
            this.parryWindow = 12;
            this.parryCooldown = 40;
        }
    }

    shootShuriken() {
        if (this.shurikenCooldown > 0 || this.chakra < 5 || this.laserLock) return;

        const dir = this.facing;
        shurikens.push(new Shuriken(
            this.x + this.w / 2 + dir * 30,
            this.y + this.h / 2 - 10,
            dir
        ));

        this.shurikenCooldown = 21; // ~0.35s at 60fps
        this.chakra = Math.max(0, this.chakra - 5);
    }

    castLaser() {
        if (this.chakra < this.maxChakra || this.laserCooldown > 0 || this.laserLock) return;

        this.laserLock = true;
        this.laserCooldown = 240; // 4s
        this.chakra = 0;

        laser = new ChakraLaser(
            this.x + this.w / 2,
            this.y + this.h / 2,
            this.facing
        );
    }
}

/* ------------------------------------------------------------
   SHURIKEN
------------------------------------------------------------ */
class Shuriken {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.dir = dir;
        this.speed = 18;
        this.life = 60;
        this.angle = 0;
        this.damage = 11;
    }

    update() {
        this.x += this.speed * this.dir;
        this.angle += 0.4 * this.dir;
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const a = (Math.PI / 2) * i;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * this.r, Math.sin(a) * this.r);
        }
        ctx.stroke();

        ctx.restore();
    }
}

/* ------------------------------------------------------------
   CHAKRA LASER
------------------------------------------------------------ */
class ChakraLaser {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.timer = 0;
        this.chargeTime = 18; // 0.3s
        this.duration = 72;   // 1.2s
        this.width = 120;
        this.length = W * 1.2;
    }

    update() {
        this.timer++;
        if (this.timer > this.chargeTime + this.duration) {
            laser = null;
            player.laserLock = false;
            return;
        }

        if (this.timer === this.chargeTime) {
            screenShake = 12;
        }

        // Damage window
        if (this.timer > this.chargeTime && bot && bot.hp > 0) {
            const beamX1 = this.dir === 1 ? this.x : this.x - this.length;
            const beamX2 = this.dir === 1 ? this.x + this.length : this.x;
            const beamY1 = this.y - this.width / 2;
            const beamY2 = this.y + this.width / 2;

            const bx1 = bot.x;
            const bx2 = bot.x + bot.w;
            const by1 = bot.y;
            const by2 = bot.y + bot.h;

            if (bx2 > beamX1 && bx1 < beamX2 && by2 > beamY1 && by1 < beamY2) {
                bot.hp -= 0.9; // continuous damage
                bot.x += this.dir * 0.9;
            }
        }
    }

    draw(ctx) {
        if (this.timer < this.chargeTime) {
            // Charge glow
            const t = this.timer / this.chargeTime;
            ctx.save();
            ctx.globalAlpha = 0.4 + 0.4 * t;
            const radius = 80 + 40 * t;
            const grad = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, radius
            );
            grad.addColorStop(0, "rgba(255,255,255,1)");
            grad.addColorStop(0.5, "rgba(110,203,255,0.9)");
            grad.addColorStop(1, "rgba(160,80,255,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        const beamProgress = (this.timer - this.chargeTime) / this.duration;
        const alpha = 0.9 - 0.6 * beamProgress;

        const len = this.length;
        const w = this.width;

        const x1 = this.dir === 1 ? this.x : this.x - len;
        const x2 = this.dir === 1 ? this.x + len : this.x;

        ctx.save();
        ctx.globalAlpha = alpha;

        const grad = ctx.createLinearGradient(x1, this.y, x2, this.y);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.3, "rgba(110,203,255,1)");
        grad.addColorStop(1, "rgba(160,80,255,0.9)");

        ctx.fillStyle = grad;
        ctx.fillRect(x1, this.y - w / 2, x2 - x1, w);

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(x1, this.y - w / 4, x2 - x1, w / 2);

        ctx.restore();
    }
}

/* ------------------------------------------------------------
   BOT
------------------------------------------------------------ */
class Bot {
    constructor() {
        this.x = 900;
        this.y = 500;
        this.w = 60;
        this.h = 90;

        this.vx = 0;
        this.vy = 0;

        this.speed = 4.5;
        this.gravity = 0.9;

        this.hp = 100;
        this.maxHP = 100;

        this.stunned = 0;
        this.attackCooldown = 0;
    }

    update() {
        if (this.hp <= 0) return;

        if (this.stunned > 0) {
            this.stunned--;
            return;
        }

        if (player.x < this.x - 10) this.vx = -this.speed;
        else if (player.x > this.x + 10) this.vx = this.speed;
        else this.vx = 0;

        this.x += this.vx;

        this.vy += this.gravity;
        this.y += this.vy;

        if (this.y + this.h > 650) {
            this.y = 650 - this.h;
            this.vy = 0;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
        else {
            if (Math.abs(this.x - player.x) < 90) {
                this.attackCooldown = 45;
                botAttack();
            }
        }
    }
}

/* ------------------------------------------------------------
   BOT ATTACK + PARRY
------------------------------------------------------------ */
function botAttack() {
    if (player.parryWindow > 0) {
        bot.stunned = 45;
        bot.hp -= 18;
        fxCtx.fillStyle = "rgba(255,255,255,0.5)";
        fxCtx.fillRect(0, 0, W, H);
        return;
    }
    player.hp -= 12;
}

/* ------------------------------------------------------------
   ARENA INTRO
------------------------------------------------------------ */
function drawArenaIntro() {
    const t = arenaIntroTimer;
    const alpha = t / 120;

    bgCtx.fillStyle = `rgba(0,0,0,${alpha})`;
    bgCtx.fillRect(0, 0, W, H);

    bgCtx.fillStyle = "rgba(110,203,255,0.18)";
    bgCtx.beginPath();
    bgCtx.arc(W / 2, H / 2 + 80, 420, 0, Math.PI * 2);
    bgCtx.fill();

    if (t < 90) {
        worldCtx.fillStyle = "rgba(110,203,255,0.9)";
        worldCtx.font = "26px Segoe UI";
        worldCtx.textAlign = "center";
        worldCtx.fillText("Protocol 1252 — Arena Sector", W / 2, H / 2 - 120);
    }
}

/* ------------------------------------------------------------
   BACKGROUND
------------------------------------------------------------ */
function drawBackground() {
    const grad = bgCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#05060a");
    grad.addColorStop(1, "#101320");
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, W, H);

    bgCtx.fillStyle = "rgba(255,255,255,0.04)";
    for (let i = 0; i < 6; i++) {
        const y = 200 + i * 60;
        bgCtx.fillRect(150, y, W - 300, 2);
    }
}

/* ------------------------------------------------------------
   DRAW NINJA + BOT
------------------------------------------------------------ */
function drawPlayer() {
    worldCtx.save();
    worldCtx.translate(player.x + player.w / 2, player.y + player.h / 2);
    worldCtx.scale(player.facing, 1);

    worldCtx.fillStyle = "#0f1724";
    worldCtx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);

    worldCtx.fillStyle = "#ffffff";
    worldCtx.fillRect(6, -player.h / 4, 14, 6);

    worldCtx.restore();

    worldCtx.beginPath();
    worldCtx.moveTo(player.scarf[0].x, player.scarf[0].y);
    for (let i = 1; i < player.scarf.length; i++) {
        worldCtx.lineTo(player.scarf[i].x, player.scarf[i].y);
    }
    worldCtx.strokeStyle = "rgba(110,203,255,0.9)";
    worldCtx.lineWidth = 4;
    worldCtx.stroke();
}

function drawBot() {
    if (bot.hp <= 0) return;

    worldCtx.fillStyle = "#240f14";
    worldCtx.fillRect(bot.x, bot.y, bot.w, bot.h);

    worldCtx.fillStyle = "#ff6e6e";
    worldCtx.fillRect(bot.x + 10, bot.y + 20, 14, 6);
}

/* ------------------------------------------------------------
   DRAW SWORD TRAIL
------------------------------------------------------------ */
function drawSwordTrail() {
    player.swordTrail.forEach(t => {
        const lifeT = t.life / 14;
        const alpha = 0.6 * lifeT;

        worldCtx.save();
        worldCtx.translate(t.x, t.y);
        worldCtx.scale(t.facing, 1);

        const radius = 90;
        worldCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
        worldCtx.lineWidth = 7 * lifeT;
        worldCtx.beginPath();
        worldCtx.arc(0, 0, radius, -0.2 * Math.PI, 1.1 * Math.PI);
        worldCtx.stroke();

        worldCtx.restore();
    });
}

/* ------------------------------------------------------------
   SCREEN SHAKE
------------------------------------------------------------ */
function applyScreenShake() {
    if (screenShake <= 0) return;
    screenShake--;
    const dx = (Math.random() - 0.5) * screenShake * 2;
    const dy = (Math.random() - 0.5) * screenShake * 2;
    worldCtx.translate(dx, dy);
    fxCtx.translate(dx, dy);
}

/* ------------------------------------------------------------
   HUD
------------------------------------------------------------ */
function updateHUD() {
    const php = document.getElementById("playerHP");
    const ehp = document.getElementById("enemyHP");

    php.style.width = (Math.max(0, player.hp) / player.maxHP * 300) + "px";
    ehp.style.width = (Math.max(0, bot.hp) / bot.maxHP * 260) + "px";

    // Chakra bar drawn on FX canvas
    const w = 260;
    const h = 10;
    const x = W / 2 - w / 2;
    const y = 70;

    const ratio = player.chakra / player.maxChakra;

    fxCtx.save();
    fxCtx.fillStyle = "rgba(20,30,50,0.9)";
    fxCtx.fillRect(x - 2, y - 2, w + 4, h + 4);

    const grad = fxCtx.createLinearGradient(x, y, x + w, y);
    if (ratio < 0.5) {
        grad.addColorStop(0, "#9bdcff");
        grad.addColorStop(1, "#6ecbff");
    } else if (ratio < 1) {
        grad.addColorStop(0, "#6ecbff");
        grad.addColorStop(1, "#2aaaff");
    } else {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.5, "#6ecbff");
        grad.addColorStop(1, "#a050ff");
    }

    fxCtx.fillStyle = grad;
    fxCtx.fillRect(x, y, w * ratio, h);

    if (ratio >= 1) {
        fxCtx.strokeStyle = "rgba(160,80,255,0.9)";
        fxCtx.lineWidth = 2;
        fxCtx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    }

    fxCtx.restore();
}

/* ------------------------------------------------------------
   START BUTTON
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
    arenaIntroTimer = 120;
    arenaIntroDone = false;
    requestAnimationFrame(gameLoop);
}

/* ------------------------------------------------------------
   MAIN LOOP
------------------------------------------------------------ */
function gameLoop() {
    bgCtx.setTransform(1, 0, 0, 1, 0, 0);
    worldCtx.setTransform(1, 0, 0, 1, 0, 0);
    fxCtx.setTransform(1, 0, 0, 1, 0, 0);

    bgCtx.clearRect(0, 0, W, H);
    worldCtx.clearRect(0, 0, W, H);
    fxCtx.clearRect(0, 0, W, H);

    drawBackground();

    if (!arenaIntroDone) {
        arenaIntroTimer--;
        drawArenaIntro();
        if (arenaIntroTimer <= 0) arenaIntroDone = true;
        requestAnimationFrame(gameLoop);
        return;
    }

    player.update();
    bot.update();

    shurikens.forEach(s => s.update());
    shurikens = shurikens.filter(s => s.life > 0);

    if (laser) laser.update();

    // Shuriken vs bot
    shurikens.forEach(s => {
        if (bot.hp <= 0) return;
        if (
            s.x > bot.x &&
            s.x < bot.x + bot.w &&
            s.y > bot.y &&
            s.y < bot.y + bot.h
        ) {
            bot.hp -= s.damage;
            s.life = 0;
        }
    });

    if (bot.hp <= 0) bot.hp = 0;
    if (player.hp <= 0) player.hp = 0;

    worldCtx.save();
    fxCtx.save();
    applyScreenShake();

    drawPlayer();
    drawBot();
    drawSwordTrail();

    shurikens.forEach(s => s.draw(worldCtx));
    if (laser) laser.draw(fxCtx);

    worldCtx.restore();
    fxCtx.restore();

    updateHUD();

    requestAnimationFrame(gameLoop);
}
