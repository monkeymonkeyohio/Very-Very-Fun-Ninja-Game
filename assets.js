/* ============================================================
   ASSETS.JS — WORLD DATA, PARKOUR GENERATION, OBSTACLES
   SHINOBI: LAST MAN STANDING — Protocol 1252
============================================================ */

/* ------------------------------------------------------------
   GLOBAL CONSTANTS
------------------------------------------------------------ */
const WORLD_WIDTH = 2400;       // Arena width
const WORLD_HEIGHT = 900;       // Arena height

const PARKOUR_SEGMENTS_MIN = 6;
const PARKOUR_SEGMENTS_MAX = 8;

const PLATFORM_WIDTH = 220;
const PLATFORM_HEIGHT = 30;

const SPIKE_DAMAGE = 40;
const LASER_DAMAGE = 60;
const BOMB_DAMAGE = 120;

/* ------------------------------------------------------------
   UTILITY FUNCTIONS
------------------------------------------------------------ */
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(rand(min, max));
}

function chance(p) {
    return Math.random() < p;
}

/* ------------------------------------------------------------
   PLATFORM OBJECT
------------------------------------------------------------ */
class Platform {
    constructor(x, y, w = PLATFORM_WIDTH, h = PLATFORM_HEIGHT) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = "platform";
    }
}

/* ------------------------------------------------------------
   SPIKE OBJECT
------------------------------------------------------------ */
class Spike {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 60;
        this.h = 40;
        this.damage = SPIKE_DAMAGE;
        this.type = "spike";
    }
}

/* ------------------------------------------------------------
   LASER OBJECT
------------------------------------------------------------ */
class Laser {
    constructor(x, y, vertical = true) {
        this.x = x;
        this.y = y;
        this.vertical = vertical;
        this.length = vertical ? 300 : 500;
        this.damage = LASER_DAMAGE;
        this.type = "laser";
    }
}

/* ------------------------------------------------------------
   BOMB OBJECT
------------------------------------------------------------ */
class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 40;
        this.timer = rand(2.5, 4.5);
        this.damage = BOMB_DAMAGE;
        this.type = "bomb";
    }
}

/* ------------------------------------------------------------
   DIAMOND OBJECT
------------------------------------------------------------ */
class Diamond {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 40;
        this.h = 40;
        this.type = "diamond";
    }
}

/* ------------------------------------------------------------
   PARKOUR GENERATION
------------------------------------------------------------ */
function generateParkour() {
    const segments = randInt(PARKOUR_SEGMENTS_MIN, PARKOUR_SEGMENTS_MAX + 1);

    const platforms = [];
    const spikes = [];
    const lasers = [];
    const bombs = [];

    let x = 200;
    let y = 500;

    for (let i = 0; i < segments; i++) {
        // Create platform
        const p = new Platform(x, y);
        platforms.push(p);

        // Random obstacles
        if (chance(0.35)) spikes.push(new Spike(x + randInt(20, 160), y - 40));
        if (chance(0.25)) lasers.push(new Laser(x + randInt(40, 160), y - 200, chance(0.5)));
        if (chance(0.20)) bombs.push(new Bomb(x + randInt(20, 160), y - 20));

        // Move to next platform
        x += randInt(260, 420);
        y += randInt(-120, 120);

        // Clamp vertical range
        y = Math.max(200, Math.min(700, y));
    }

    // Final platform gets the diamond
    const last = platforms[platforms.length - 1];
    const diamond = new Diamond(last.x + last.w / 2 - 20, last.y - 50);

    return {
        platforms,
        spikes,
        lasers,
        bombs,
        diamond,
        width: x + 400,
        height: 900
    };
}

/* ------------------------------------------------------------
   EXPORT
------------------------------------------------------------ */
const Assets = {
    generateParkour,
    Platform,
    Spike,
    Laser,
    Bomb,
    Diamond
};
