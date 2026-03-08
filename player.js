/* ============================================================
   PLAYER.JS — MOVEMENT & PHYSICS
============================================================ */

export class Player {
    constructor(world, fx) {
        this.world = world;
        this.fx = fx;

        this.x = 300;
        this.y = 400;
        this.vx = 0;
        this.vy = 0;

        this.width = 40;
        this.height = 80;

        this.speed = 600;
        this.jumpStrength = 1050;
        this.gravity = 2600;
        this.maxFall = 2000;

        this.grounded = false;
        this.facing = 1;

        // Coyote & buffer
        this.coyoteTime = 0.1;
        this.coyoteTimer = 0;
        this.jumpBufferTime = 0.1;
        this.jumpBufferTimer = 0;
    }

    handleInput(keys) {
        let move = 0;
        if (keys.has("a") || keys.has("arrowleft")) move -= 1;
        if (keys.has("d") || keys.has("arrowright")) move += 1;

        this.vx = move * this.speed;
        if (move !== 0) this.facing = move;

        // Jump buffer
        if (keys.has(" ") || keys.has("w") || keys.has("arrowup")) {
            this.jumpBufferTimer = this.jumpBufferTime;
        }
    }

    tryJump() {
        if (this.coyoteTimer > 0 && this.jumpBufferTimer > 0) {
            this.vy = -this.jumpStrength;
            this.grounded = false;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
        }
    }

    applyPhysics(dt) {
        this.vy += this.gravity * dt;
        if (this.vy > this.maxFall) this.vy = this.maxFall;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Simple world collision
        const result = this.world.resolvePlayerCollision(this);
        if (result.grounded && !this.grounded && this.vy >= 0) {
            // soft landing hook
            this.fx.landSoft(this.x, this.y);
        }
        this.grounded = result.grounded;

        if (this.grounded) {
            this.coyoteTimer = this.coyoteTime;
        } else {
            this.coyoteTimer -= dt;
        }

        this.jumpBufferTimer -= dt;

        this.tryJump();
    }

    update(dt) {
        this.applyPhysics(dt);
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);

        // Simple placeholder body
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);

        ctx.restore();
    }
}
