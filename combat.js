/* ============================================================
   COMBAT.JS — SWORD, PARRY, FINISHER
============================================================ */

export class CombatSystem {
    constructor(player, enemyManager, fx) {
        this.player = player;
        this.enemies = enemyManager;
        this.fx = fx;

        this.attackCooldown = 0.25;
        this.attackTimer = 0;

        this.parryWindow = 0.15;
        this.parryActive = false;
        this.parryTimer = 0;

        this.finisherReady = false;
    }

    startAttack() {
        if (this.attackTimer > 0) return;
        this.attackTimer = this.attackCooldown;

        const hitbox = {
            x: this.player.x + this.player.facing * 50,
            y: this.player.y - 40,
            w: 80,
            h: 60
        };

        const hits = this.enemies.hitEnemies(hitbox, 1);
        if (hits.length > 0) {
            this.fx.swordHit(hitbox.x, hitbox.y);
        } else {
            this.fx.swordSwing(this.player.x, this.player.y);
        }
    }

    startParry() {
        this.parryActive = true;
        this.parryTimer = this.parryWindow;
        this.fx.parryStart(this.player.x, this.player.y);
    }

    updateParry(dt) {
        if (!this.parryActive) return;
        this.parryTimer -= dt;
        if (this.parryTimer <= 0) {
            this.parryActive = false;
        }
    }

    update(dt, keys) {
        this.attackTimer -= dt;

        // Attack input: J / K / Left Click
        if (keys.has("j") || keys.has("k")) {
            this.startAttack();
        }

        // Parry input: L
        if (keys.has("l") && !this.parryActive) {
            this.startParry();
        }

        this.updateParry(dt);
    }
}
