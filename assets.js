/* ============================================================
   ASSETS.JS — SPRITES / AUDIO LOADER (ES MODULE)
   SHINOBI: LAST MAN STANDING — Protocol 1252
============================================================ */

/*
    This loader is designed to be:
    - fully asynchronous
    - easy to expand
    - safe if assets fail
    - compatible with GitHub Pages
    - clean for ES modules

    Usage:
        const assets = await loadAssets();
        assets.img.playerIdle   → Image object
        assets.sfx.swordSwing   → Audio object
*/

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
       DEFINE YOUR ASSETS HERE
       (You can add sprites later without touching other files)
    ------------------------------------------------------------ */

    const imageList = {
        // Example placeholders — add your sprites later:
        playerIdle: "assets/player_idle.png",
        playerRun: "assets/player_run.png",
        enemyBasic: "assets/enemy_basic.png",
        fxSpark: "assets/fx_spark.png",
        fxPortal: "assets/fx_portal.png"
    };

    const audioList = {
        swordSwing: "assets/sfx_swing.wav",
        swordHit: "assets/sfx_hit.wav",
        parry: "assets/sfx_parry.wav",
        shuriken: "assets/sfx_shuriken.wav",
        laser: "assets/sfx_laser.wav",
        portal: "assets/sfx_portal.wav"
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

    /* ------------------------------------------------------------
       RETURN ASSET OBJECT
    ------------------------------------------------------------ */
    console.log("Assets loaded:", assets);
    return assets;
}
