/* ============================================================
   FX.JS — PARTICLES, TRAILS, CAMERA SHAKE
============================================================ */

export class FXSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
    }

    landSoft(x, y) {
        this.particles.push({ x, y, r: 20, life: 0.2, type: "dust" });
    }

    swordSwing(x, y) {
        this.particles.push({ x, y, r: 30, life: 0.15, type: "swing" });
    }

    swordHit(x, y) {
        this.particles.push({ x, y, r: 25, life: 0.2, type: "hit" });
    }

    shurikenHit(x, y) {
        this.particles.push({ x, y, r: 20, life: 0.2, type: "spark" });
    }

    laserBeam(beam) {
        this.particles.push({ beam, life: 0.1, type: "laser" });
    }

    portalSpawn(x, y) {
        this.particles.push({ x, y, r: 40, life: 0.4, type: "portal" });
    }

    parryStart(x, y) {
        this.particles.push({ x, y, r: 30, life: 0.15, type: "parry" });
    }

    update(dt) {
        for (const p of this.particles) {
            p.life -= dt;
        }
        this.particles = this.particles.filter(p => p.life > 0);
    }

    render(ctx) {
        for (const p of this.particles) {
            ctx.save();
            if (p.type === "dust") {
                ctx.fillStyle = "rgba(200,200,200,0.4)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === "swing") {
                ctx.strokeStyle = "rgba(255,255,255,0.6)";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, -0.5, 0.5);
                ctx.stroke();
            } else if (p.type === "hit" || p.type === "spark") {
                ctx.fillStyle = "rgba(255,200,80,0.8)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === "laser") {
                ctx.fillStyle = "rgba(80,200,255,0.7)";
                const b = p.beam;
                ctx.fillRect(
                    b.x,
                    b.y - b.h / 2,
                    b.w,
                    b.h
                );
            } else if (p.type === "portal") {
                ctx.strokeStyle = "rgba(120,80,255,0.8)";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.stroke();
            } else if (p.type === "parry") {
                ctx.strokeStyle = "rgba(80,255,255,0.9)";
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}
