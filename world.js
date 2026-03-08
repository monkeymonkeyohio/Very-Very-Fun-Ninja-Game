/* ============================================================
   WORLD.JS — PLATFORMS & COLLISION
============================================================ */

export class World {
    constructor() {
        this.platforms = [
            { x: 0, y: 500, w: 1280, h: 40 },
            { x: 400, y: 380, w: 200, h: 20 },
            { x: 800, y: 320, w: 200, h: 20 }
        ];
    }

    resolvePlayerCollision(player) {
        let grounded = false;

        for (const p of this.platforms) {
            const px = p.x;
            const py = p.y;
            const pw = p.w;
            const ph = p.h;

            const left = player.x - player.width / 2;
            const right = player.x + player.width / 2;
            const top = player.y - player.height;
            const bottom = player.y;

            if (right > px && left < px + pw && bottom > py && top < py + ph) {
                // simple from top
                if (player.vy >= 0 && bottom - player.vy * 0.016 <= py) {
                    player.y = py;
                    player.vy = 0;
                    grounded = true;
                }
            }
        }

        return { grounded };
    }

    resolveEnemyCollision(enemy) {
        // simple: keep them above ground
        for (const p of this.platforms) {
            const left = enemy.x - enemy.w / 2;
            const right = enemy.x + enemy.w / 2;
            const top = enemy.y - enemy.h;
            const bottom = enemy.y;

            if (right > p.x && left < p.x + p.w && bottom > p.y && top < p.y + p.h) {
                if (enemy.vy >= 0) {
                    enemy.y = p.y;
                    enemy.vy = 0;
                }
            }
        }
    }

    update(dt) {}

    renderBackground(ctx) {
        ctx.fillStyle = "#050810";
        ctx.fillRect(0, 0, 1280, 720);
    }

    render(ctx) {
        ctx.fillStyle = "#222";
        for (const p of this.platforms) {
            ctx.fillRect(p.x, p.y, p.w, p.h);
        }
    }
}
