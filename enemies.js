/* ============================================================
   ENEMIES.JS — ENEMY AI & DAMAGE
============================================================ */

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;

        this.w = 40;
        this.h = 80;

        this.hp = 3;
        this.dead = false;
    }

    update(dt, player, world) {
        if (this.dead) return;

        const dir = Math.sign(player.x - this.x);
        this.vx = dir * 200;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        world.resolveEnemyCollision(this);
    }

    render(ctx) {
        if (this.dead) return;
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(this.x - this.w / 2, this.y - this.h, this.w, this.h);
    }

    hit(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.dead = true;
        }
    }
}

export class EnemyManager {
    constructor(world, fx) {
        this.world = world;
        this.fx = fx;
        this.enemies = [];

        // temp spawn
        this.enemies.push(new Enemy(700, 400));
        this.enemies.push(new Enemy(900, 400));
    }

    update(dt, player) {
        for (const e of this.enemies) {
            e.update(dt, player, this.world);
        }
        this.enemies = this.enemies.filter(e => !e.dead);
    }

    render(ctx) {
        for (const e of this.enemies) {
            e.render(ctx);
        }
    }

    hitEnemies(rect, dmg) {
        const hits = [];
        for (const e of this.enemies) {
            if (e.dead) continue;
            if (rectIntersect(rect, {
                x: e.x - e.w / 2,
                y: e.y - e.h,
                w: e.w,
                h: e.h
            })) {
                e.hit(dmg);
                hits.push(e);
            }
        }
        return hits;
    }

    hitEnemiesCircle(cx, cy, r, dmg) {
        const hits = [];
        for (const e of this.enemies) {
            if (e.dead) continue;
            const ex = e.x;
            const ey = e.y - e.h / 2;
            const dx = ex - cx;
            const dy = ey - cy;
            if (dx * dx + dy * dy <= r * r) {
                e.hit(dmg);
                hits.push(e);
            }
        }
        return hits;
    }
}

function rectIntersect(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}
