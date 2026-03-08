/* ============================================================
   ASSETS.JS — UPDATED FOR NEW SPRITE STRUCTURE
   SHINOBI: LAST MAN STANDING — Protocol 1252
============================================================ */

export async function loadAssets() {
    const assets = {
        img: {},
        sfx: {}
    };

    /* ------------------------------------------------------------
       IMAGE LOADER
    ------------------------------------------------------------ */
    async function loadImage(name, src) {
        return new Promise(resolve => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Image failed to load: ${src}`);
                resolve(null);
            };
        });
    }

    /* ------------------------------------------------------------
       AUDIO LOADER
    ------------------------------------------------------------ */
    async function loadAudio(name, src, volume = 1.0) {
        return new Promise(resolve => {
            const audio = new Audio();
            audio.src = src;
            audio.volume = volume;
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => {
                console.warn(`Audio failed to load: ${src}`);
                resolve(null);
            };
        });
    }

    /* ------------------------------------------------------------
       NEW IMAGE LIST — MATCHES YOUR GITHUB REPO
    ------------------------------------------------------------ */

    const imageList = {
        // Idle
        idle_0: "assets/player/idle_0.png",
        idle_1: "assets/player/idle_1.png",
        idle_2: "assets/player/idle_2.png",
        idle_3: "assets/player/idle_3.png",
        idle_4: "assets/player/idle_4.png",
        idle_5: "assets/player/idle_5.png",

        // Run
        run_0: "assets/player/run_0.png",
        run_1: "assets/player/run_1.png",
        run_2: "assets/player/run_2.png",
        run_3: "assets/player/run_3.png",
        run_4: "assets/player/run_4.png",
        run_5: "assets/player/run_5.png",
        run_6: "assets/player/run_6.png",
        run_7: "assets/player/run_7.png",

        // Jump / Fall
        jump_0: "assets/player/jump_0.png",
        fall_0: "assets/player/fall_0.png",

        // Attack
        attack_0: "assets/player/attack_0.png",
        attack_1: "assets/player/attack_1.png",
        attack_2: "assets/player/attack_2.png",
        attack_3: "assets/player/attack_3.png",
        attack_4: "assets/player/attack_4.png",

        // Parry
        parry_0: "assets/player/parry_0.png",
        parry_1: "assets/player/parry_1.png",
        parry_2: "assets/player/parry_2.png",
        parry_3: "assets/player/parry_3.png",

        // Finisher
        finisher_0: "assets/player/finisher_0.png",
        finisher_1: "assets/player/finisher_1.png",
        finisher_2: "assets/player/finisher_2.png",
        finisher_3: "assets/player/finisher_3.png",
        finisher_4: "assets/player/finisher_4.png",
        finisher_5: "assets/player/finisher_5.png",
        finisher_6: "assets/player/finisher_6.png",
        finisher_7: "assets/player/finisher_7.png",

        // Shuriken
        shuriken_0: "assets/player/shuriken_0.png",
        shuriken_1: "assets/player/shuriken_1.png",
        shuriken_2: "assets/player/shuriken_2.png",
        shuriken_3: "assets/player/shuriken_3.png",

        // Laser
        laser_start: "assets/player/laser_start.png",
        laser_mid: "assets/player/laser_mid.png",
        laser_end: "assets/player/laser_end.png",

        // Portal
        portal_0: "assets/player/portal_0.png",
        portal_1: "assets/player/portal_1.png",
        portal_2: "assets/player/portal_2.png",
        portal_3: "assets/player/portal_3.png",

        // Scarf + Afterimage
        scarf_0: "assets/player/scarf_0.png",
        afterimage_0: "assets/player/afterimage_0.png"
    };

    /* ------------------------------------------------------------
       AUDIO LIST — WILL LOAD ONCE YOU ADD THE FILES
    ------------------------------------------------------------ */

    const audioList = {
        swing: "assets/sfx/swing.wav",
        hit: "assets/sfx/hit.wav",
        parry: "assets/sfx/parry.wav",
        shuriken: "assets/sfx/shuriken.wav",
        laser: "assets/sfx/laser.wav",
        portal: "assets/sfx/portal.wav"
    };

    /* ------------------------------------------------------------
       LOAD IMAGES
    ------------------------------------------------------------ */
    for (const [name, src] of Object.entries(imageList)) {
        assets.img[name] = await loadImage(name, src);
    }

    /* ------------------------------------------------------------
       LOAD AUDIO
    ------------------------------------------------------------ */
    for (const [name, src] of Object.entries(audioList)) {
        assets.sfx[name] = await loadAudio(name, src, 0.8);
    }

    console.log("Assets loaded:", assets);
    return assets;
}
