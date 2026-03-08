/* ============================================================
   PLAYER.JS — MOVEMENT, PHYSICS & ANIMATION
============================================================ */

const ANIM_FRAMES = {
    idle: 6,
    run: 8,
    jump: 1,
    fall: 1
};

export class Player {
    constructor(world, fx) {
        this.world = world;
        this.fx = fx;

        // Position & velocity
        this.x = 300;
        this.y = 400;
        this.vx = 0;
        this.vy = 0;

        // Size
        this.width = 40;
        this.height = 80;

        // Movement
        this.speed = 600;
        this.jumpStrength = 1050;
        this.gravity = 2600;
        this.maxFall = 2000;

        // State
        this.grounded = false;
        this.facing = 1;

        // Coyote & jump buffer
        this.coyoteTime = 0.1;
        this.coyoteTimer = 0;
        this.jumpBufferTime = 0.1;
        this.jumpBufferTimer = 0;

        // Animation
        this.anim = {
            state: "idle",
            frame: 0,
            timer: 0,
            speed: 0.08
        };
    }

    /* ------------------------------------------------------------
       INPUT
    ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       JUMP LOGIC
    ------------------------------------------------------------ */
    tryJump() {
        if (this.coyoteTimer > 0 && this.jumpBufferTimer > 0) {
            this.vy = -this.jumpStrength;
            this.grounded = false;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
        }
    }

    /* ------------------------------------------------------------
       PHYSICS
    ------------------------------------------------------------ */
    applyPhysics(dt) {
        this.vy += this.gravity * dt;
        if (this.vy > this.maxFall) this.vy = this.maxFall;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // World collision
        const result = this.world.resolvePlayerCollision(this);

        if (result.grounded && !this.grounded && this.vy >= 0) {
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

    /* ------------------------------------------------------------
       ANIMATION STATE MACHINE
    ------------------------------------------------------------ */
    updateAnimation(dt) {
        // Pick animation state
        if (!this.grounded) {
            this.anim.state = this.vy < 0 ? "jump" : "fall";
        } else if (Math.abs(this.vx) > 10) {
            this.anim.state = "run";
        } else {
            this.anim.state = "idle";
        }

        // Frame timing
        this.anim.timer += dt;
        if (this.anim.timer >= this.anim.speed) {
            this.anim.timer = 0;
            this.anim.frame++;
        }
    }

    getCurrentFrameName() {
        const state = this.anim.state;
        const max = ANIM_FRAMES[state];
        const frame = this.anim.frame % max;
        return `${state}_${frame}`;
    }

    /* ------------------------------------------------------------
       UPDATE
    ------------------------------------------------------------ */
    update(dt) {
        this.applyPhysics(dt);
        this.updateAnimation(dt);
    }

    /* ------------------------------------------------------------
       RENDER
    ------------------------------------------------------------ */
    render(ctx, assets) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);

        const frameName = this.getCurrentFrameName();
        const img = assets.img[frameName];

        if (img) {
            ctx.drawImage(img, -32, -64, 64, 64);
        } else {
            // fallback white box
            ctx.fillStyle = "#fff";
            ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);
        }

        ctx.restore();
    }
}
