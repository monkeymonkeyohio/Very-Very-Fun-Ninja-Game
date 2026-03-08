/* ============================================================
   ABILITIES.JS — SHURIKEN, LASER, PORTAL
============================================================ */

export class AbilitySystem {
    constructor(player, enemyManager, fx) {
        this.player = player;
        this.enemies = enemyManager;
        this.fx = fx;

        this.projectiles = [];
        this.chakra = 100;
    }

    castShuriken() {
        if (this.chakra < 5) return;
        this.chakra -= 5;

        this.projectiles.push({
            type: "shuriken",
            x: this.player.x,
            y: this.player.y - 40,
            vx: this.player.facing * 900,
            vy: 0,
            r: 10
        });
    }

    castLaser() {
        if (this.chakra < 25) return;
        this.chakra -= 25;

        const beam = {
            x: this.player.x,
            y: this.player.y - 40,
            w: this.player.facing * 600,
            h: 40
        };

        this.enemies.hitEnemies(beam, 3);
        this.fx.laserBeam(beam);
    }

    spawnPortal() {
        this.fx.portalSpawn(this.player.x + this.player.facing * 80, this.player.y);
    }

    updateProjectiles(dt) {
        for (const p of this.projectiles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === "shuriken") {
                const hits = this.enemies.hitEnemiesCircle(p.x, p.y, p.r, 1);
                if (hits.length > 0) {
                    this.fx.shurikenHit(p.x, p.y);
                    p.dead = true;
                }
            }
        }
        this.projectiles = this.projectiles.filter(p => !p.dead);
    }

    update(dt, keys) {
        // Q = shuriken, E = laser, R = portal
        if (keys.has("q")) this.castShuriken();
        if (keys.has("e")) this.castLaser();
        if (keys.has("r")) this.spawnPortal();

        this.updateProjectiles(dt);
    }
}
