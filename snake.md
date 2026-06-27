# 🐍 SNAKE.md — LILITH · Serpent Fine Jewellery

> Single source of truth for the LILITH snake-ring website project.
> If the user says **"find snake.md"** → this file. Read it fully, then continue.

---

## 0. WHERE IT LIVES
- **Working project:** `~/dev/snake-ring/`
- **Saved copy (full, all files/images/videos):** `~/Desktop/LILITH-snake-ring/`
- **The actual site:** `~/dev/snake-ring/site/`
- **Prompts:** `~/dev/snake-ring/PROMPTS.txt` and `~/dev/snake-ring/NEW-PROMPTS.txt`
- **This log:** `~/dev/snake-ring/snake.md` (also copied to Desktop)

## RUN IT
```bash
cd ~/dev/snake-ring/site && python3 -m http.server 8137 --bind 0.0.0.0
```
- Desktop: http://127.0.0.1:8137/
- Mobile (same wifi/hotspot): http://<LAN-IP>:8137/  (LAN IP via `ipconfig getifaddr en0`; has been 172.20.10.14)
- Node lives at `~/.local/node` (NOT on PATH) → `export PATH="$HOME/.local/node/bin:$PATH"` before npm/node.

---

## 1. WHAT IT IS
A **full-luxury, dark, mobile-first** website to **preorder** the user's real snake rings (a coiled, faceted/hammered serpent ring whose head rises; eyes can hold gemstones; mouth can be opened as a **cigarette holder**). Brand name: **LILITH** (chosen by the user; was briefly "VENIN"). Static HTML/CSS/JS, **no framework**, vendored Lenis smooth-scroll. Preorder model (no real payment processor) — "Reserve" → confirmation.

## 2. PRODUCT · PRICES · VARIANTS
Three metals, each with a gem:
| Metal | Gem | Base price | + Gemstone eyes |
|---|---|---|---|
| Yellow Gold | Ruby | $6,000 | +$1,500 |
| Rose Gold | Black Onyx | $7,000 | +$1,000 |
| Platinum | Emerald | $8,500 | +$2,500 |

Configurator options (logic):
- **Eyes:** Bare (included) **or** gemstone eyes (paid, per table).
- **Mouth:** Closed/In repose (included) **or** Open · Cigarette Holder (**FREE but requires gemstone eyes** — the open-mouth option is disabled until eyes are chosen).
- Prices are PLACEHOLDER — confirm exact numbers/currency with the user.

## 3. SITE ARCHITECTURE (two pages)
**The user explicitly wanted the loader to be its OWN page.**
1. **`index.html` = LOADER PAGE** — rose serpent **frame-on-scroll** (90 frames), big "LILITH", "Scroll" hint. Scrolling scrubs the rose snake; at the end the metallic-gold **"Enter the Maison"** button appears → links to `home.html`.
2. **`home.html` = HOMEPAGE** — brief load → **HERO film frame-on-scroll** (90 frames, the gold-jungle → gold-desert → platinum-water Seedance cut) with **per-scene captions** that cross-fade:
   - p<0.33 → "The Eternal Serpent" / 01 Maison Lilith
   - 0.33–0.56 → "Forged in fire" / 02 Yellow Gold · Ruby
   - >0.56 → "Cooled in water" / 03 Platinum · Emerald
   Then the **site**: manifesto ("Every serpent is *singular.*") → ethos (01/02/03 rows) → collection (3 cards) → footer → **configurator**.

Each page loads ONLY its own film (separating them fixed the mobile memory problem).

## 4. FILE MAP (`~/dev/snake-ring/site/`)
```
index.html        loader page
home.html         homepage (hero + site + configurator)
styles.css        shared styles (loader-page + home sections)
config.css        configurator (ORIGINAL swatch+option-box layout) + metallic buttons
loader-page.js    rose frame-on-scroll engine (loader page)
home.js           hero frame-on-scroll + captions + reveal (home page)
configurator.js   Buy-Now configurator logic (shared markup IDs)
manifest.json + icon-180/192/512.png + apple-touch-icon.png   (PWA → Add to Home Screen = true iOS fullscreen)
vendor/lenis.min.js
frames/           90 ROSE loader frames, native 720x1280 webp q92
hero/             90 HERO film frames, native 720x1280 webp q92
img/config/       9 product renders: {gold,rose,platinum}-{base,eyes,open}.webp
video/loader.mp4  rose Grok video (source of loader frames)
video/hero.mp4    gold→platinum Seedance video (source of hero frames)
conv_*.js, convert.js, make_icons.js   build/extract scripts (need sharp)
node_modules/     sharp (for webp/avif encoding)
```
CACHE-BUST: every css/js link has `?v=N`. **Bump N on every change** or the browser serves stale (this bit us repeatedly). Currently **v=14**.

## 5. FRAME-ON-SCROLL ENGINE (how it works)
- A `<canvas>` is pinned (`position:sticky`) inside a tall section (`#loader` ~300vh / `#hero` ~560vh; mobile 260/440vh). The section's scroll progress → frame index.
- A single **rAF loop** reads scroll position live (`getBoundingClientRect`) and **eases** the displayed frame toward the target (`render += (target-render)*0.2`) → smooth scrub even on coarse touch. Drawing in rAF, NOT in the scroll handler (that was the original jank cause).
- `drawCover()` = object-fit cover. DPR capped at **2** (sharp; was 1.25 which looked soft).
- Frames are loaded as `<img>`; gate the loader on **onload** then fire-and-forget `img.decode()` to warm decode in the background. (Earlier I force-`await`ed all decodes before unlocking = smooth but ~330MB resident at full res → mobile risk. Now load-gated + bg decode = full quality, safe memory.)
- 4.5–5.5s safety timeout always lifts the loading state (never trap the user; also lets headless screenshots work since decode promises don't resolve in headless virtual-time).

## 6. CONFIGURATOR (`config.css` + `configurator.js`)
- **Layout = the ORIGINAL/first version** the user wanted: product image stage on top, then **METAL = 3 swatch buttons** (`.sw`, colored disc + name) in a row, **EYES / MOUTH = 2 option boxes each** (`.opt`, bordered rounded boxes with label/sub/price). (I had also built a "couture hairline-rows" version and a "futuristic mono" version — user rejected both; reverted to the original boxes.)
- Opens from any `[data-buy="gold|rose|platinum"]` (the 3 cards + the "Compose Yours" CTA). Deep-link `/#buy` opens it on gold.
- Live: image swaps to `img/config/{metal}-{variant}.webp` (variant = open ? 'open' : eyes ? 'eyes' : 'base'), price, summary, gem name. Open-mouth greys out until eyes selected (flashes the eyes row as a nudge). "Reserve" → confirmation panel. Masthead hidden while open (`body.cfg-open #mast`).
- Buttons: **metallic gold** (vertical gradient + inset highlight + shadow + sliding arrow) — `.btn-gold,.cta-primary,#cfgBuy,#enterBtn`. User said flat gold blocks "sucked"; this is the fix.

## 7. ASSETS & GENERATION
- **Videos** the user generated (portrait 9:16, 720x1280, 24fps):
  - `video/loader.mp4` — rose-gold snake on light bg (Grok image-to-video). Source of the loader frames.
  - `video/hero.mp4` — gold serpent in jungle → desert → platinum serpent on water (Seedance). Source of hero frames.
- **9 product stills** (Nano Banana / image gen) for the configurator, 3 metals × {base=no eyes/closed, eyes=gems/closed, open=gems/mouth open}. Originals in `~/Downloads/*rink product*.png` → cropped/normalised (gold was ~20% more zoomed; rose cropped 0.83, platinum 0.85 to match) → `img/config/`.
- **All prompts** are in `PROMPTS.txt` (Nano Banana stills + Seedance hero scenes) and `NEW-PROMPTS.txt` (Grok loader + 3 Seedance scenes). Also produced a **Kling 3.0** serpent→ring transition prompt and Grok prompts in chat.
- Icon = cropped from a rose snake head frame.

### 7a. FINAL ONE-VIDEO HERO PROMPT (Seedance, 3 reference images, 9:16)
Attach the 3 ring images as references. Single 15s clip, jungle→desert→water:

> One continuous 15-second ultra-luxury cinematic jewelry film, vertical 9:16, a single unbroken flowing camera move with no hard cuts. A coiled snake ring stays locked at the dead center of the frame the whole time, floating in mid-air and **slowly turning a full rotation**, always tack-sharp, holding its exact rigid metal shape. The camera **never stops moving** — a slow graceful orbit that keeps gliding forward. The world transforms around the centered ring through slow seamless dissolves, like drifting through changing dreamlike rooms, while the ring stays perfectly centered.
>
> It opens as the **yellow-gold** snake ring in a lush tropical jungle — giant emerald leaves swaying, vines drifting, mist rolling through warm sun shafts, glowing spores swirling, **ruby eyes** glinting red. The jungle slowly melts and reshapes around the ring into a vast **golden desert** at dusk as the ring becomes the **rose-gold** snake ring — rippling dunes, sand streaming sideways on the wind, pink-amber light, **black onyx eyes** gleaming. The desert then dissolves into a still mirror-like **water surface** at blue hour as the ring becomes the **platinum** snake ring — soft ripples below, droplets hovering, cool silvery caustics shimmering, low mist drifting, **emerald eyes** glowing green. The camera makes one final slow push toward the ring as it settles.
>
> Photorealistic, shallow depth of field, volumetric god-rays, slow-moving specular highlights rolling across the metal as it turns, continuous weightless motion throughout, premium dreamlike commercial, 8k, film grain. No text, no logos, no people.

**KEY LESSON (cost us many Seedance credits):** No current image-to-video model can do a true *continuous camera flying through morphing worlds with 3 different product photos* in ONE generation — it treats each world as a near-static shot, the snake barely rotates, and scene changes come out as **hard cuts**. The Cartier "scene shifting" is an EDIT, not a generation.
- **Winning workflow:** generate **3 separate clips, one world each**, with motion forced ("turns a full rotation, camera orbits in, never static" as the FIRST sentence; drop the triple "rigid shape" lines that freeze it; raise motion/dynamic strength). Then stitch with crossfade/push dissolves at the cuts.
- **Stitch recipe (bundled ffmpeg at `~/.local/node/lib/node_modules/ffmpeg-static/ffmpeg`):** trim overlapping segments and `xfade=transition=fade:duration=1.3` at each cut. Demonstrated on the existing hard-cut hero → `~/Downloads/snake_smooth_v1.mp4` (14.7s, soft dissolves, zero new credits).

## 8. BUILD PIPELINE (no ffmpeg on this Mac)
- Frame extraction: **Swift AVFoundation** script `/tmp/extract_png.swift` (extracts N native PNGs from an mp4). `qlmanage`/`swift` used for video probing/thumbnails.
- Encoding: **`sharp`** (installed in `site/node_modules`) → WebP. Current: native 720x1280, quality 92.
- macOS `sips` for HEIC→PNG and resizing screenshots.
- Headless QA: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=... --window-size=W,H --virtual-time-budget=6500 URL`.

## 9. GOTCHAS / LESSONS
- **Cache:** same-named css/js cached HARD → always bump `?v=N`. iPhone: close tab & reopen (or delete+re-add Home Screen icon).
- **Mobile fullscreen:** iOS Safari ALWAYS shows its bars on a normal page — cannot hide. True fullscreen only via **Add to Home Screen** (PWA manifest + apple-mobile-web-app-capable are set). 
- **Scroll smoothness on REAL iPhone:** desktop mobile-emulation was smooth but real device janked → cause was decoding WebP during scroll. Fix = rAF live-read + ease + (background) decode + DPR sane.
- **Memory:** pre-decoding 180 frames (two films) or full-res ×90 force-resident (~330MB) risks iOS jetsam. Mitigations used: separate pages (one film each) + load-gate + bg decode.
- **Quality:** do NOT heavily downscale frames. Source is 720p; frames must be native 720x1280 q92 or the user notices ("3x worse"). DPR 2.
- **Headless:** `img.decode()` promises don't resolve under `--virtual-time-budget` → always include a setTimeout safety to lift loading, or headless shows the loader forever.
- `Date.now()`/`Math.random()` are fine in browser JS here (the ban is only inside Workflow scripts).

## 10. USER PREFERENCES (IMPORTANT — apply these)
- Aesthetic: **couture / elegant luxury** (serif Didot/Bodoni, gold, editorial, dark, cinematic). **Rejected the "futuristic mono" experiment.** Keep it expensive and restrained.
- Wants **WOW / overdo it** (cinematic, exclusive, "best craftmanship", "every piece unique").
- **Frame-on-scroll** (scrubbing), not autoplaying video, for loader + hero.
- **Quality > file size.** Don't sacrifice sharpness.
- Moves fast, gets frustrated by over-explaining or by me re-laying-out instead of polishing — prefer surgical CSS/polish over structural churn unless asked.
- Confirm vibe decisions but then ACT.

## 11. PENDING / NEXT IDEAS
- Confirm final **prices + currency**.
- Optional: regenerate videos at **1080×1920** for even sharper frames (then re-extract).
- Optional 4th metal/variant; real images for the cigarette-holder variant if redone.
- Wire "Reserve" to an actual destination (WhatsApp/email/sheet) when the user wants real preorders captured.
- The earlier-planned 3-scene "Cartier room-switch" is effectively delivered as the single hero film (jungle→desert→water).

---

## 12. JOURNEY LOG (chronological, condensed)
1. Started as a generic snake cigarette-holder ring shop idea → wrote Nano Banana image prompts (10), 3 metals + gem mapping.
2. Decided: **dark sensual luxe**, **real store** → then narrowed to **preorder**.
3. Reverse-engineered the **Cartier "Watches & Wonders" scroll** (room-switching) from the user's screen recording → wrote **Seedance** hero prompts (jungle/desert/water).
4. Brand: VENIN → **LILITH** (user picked).
5. Built the site; loader evolved a LOT: scroll-frames → real `<video>` → back to scroll-frames; loading-screen-only → hero film; finally **loader = its own page**, Enter → homepage.
6. Configurator built (swatch+box) → "couture rows" → "futuristic mono" → **reverted to original swatch+box** (user: "first version").
7. Futuristic redesign attempt (mono, tri-gradient) → user disliked → reverted to couture.
8. Frame counts tuned 120→30→60→**90** (both films, user mandate).
9. Quality: frames were 460px downscaled → user noticed → re-extracted **native 720 q92 + DPR 2**.
10. Saved everything to Desktop; wrote this snake.md.

11. Final one-video Seedance hero prompt locked (§7a); learned the hard way that 3-product morph-in-one-gen = hard cuts + static snake → transitions belong in the edit (ffmpeg xfade), demoed `snake_smooth_v1.mp4`.

12. **OBSIDIAN VENOM redesign (2026-06-26, v=16).** User rejected the prior build as "AI slop / trash." Ran the **impeccable** frontend skill (`/impeccable overdrive`). Root cause named: prior site hit the skill's hard bans — **gradient text** (`background-clip:text`), the **editorial-Didone slop lane** (serif + tracked-uppercase kickers above every section + ruled columns), and **system-Didot** falling back to Georgia (no real fonts loaded). User picked direction **"Obsidian Venom"** (occult-luxe): drenched obsidian black + single **oxblood** accent, on-myth (Lilith).
    - **Fonts now SELF-HOSTED** in `site/fonts/` (Fontshare woff2): **Melodrama** 400/500/700 (display, dramatic high-contrast serif) + **Supreme** 400/500 (body). Declared in `fonts.css`. NOT system fonts. (Supreme-600 URL 404'd, dropped.)
    - Colors in **OKLCH** tokens: `--ink` obsidian, `--blood`/`--blood-2` oxblood, `--gild` dimmed metal used sparingly. No `#000`/`#fff`.
    - **Loader fix:** brand `LILITH` is now deep oxblood (was white+screen-blend = invisible on the light rose film); added `.loader-veil` cinematic vignette; `#enterBtn` = dark glass pill w/ oxblood hover (no gold slab). `loader-hint` dark too.
    - **home.html fully rebuilt:** removed all gradient text + per-section tracked kickers. Asymmetric INCANTATION fold ("The serpent / *remembers.*"), ribbon, offset STORY + pull-quote, ATELIER hairline rows (i–iv), **COLLECTION = alternating editorial bands** (NOT a card grid), SIGNATURE open-mouth, STONES wells, BESPOKE, assurances, FAQ, inner-circle, footer. New **serpent spine** SVG that draws on scroll (`#spinePath` stroke-dashoffset in home.js).
    - Configurator restyled to obsidian/oxblood (all IDs/logic unchanged).
    - **Configurator image jump FIXED:** all 9 `img/config/*.webp` were 1200² but the *gold* snake subject was ~14% smaller & ~70px higher than rose/platinum → visible jump on metal switch. Detected each subject bbox (sharp Laplacian) and re-normalized all 9 to rose's frame (width≈985, cx≈607, bottom≈1073) by crop-only zoom. Originals backed up in `img/config_orig_backup/`.
    - Cache now **v=16** on index.html + home.html (fonts.css/styles.css/config.css/home.js/configurator.js).
    - Files added: `fonts.css`, `site/fonts/*.woff2`. `loader-page.js` unchanged; `home.js` gained spine + `body.scrolled` mast state.

13. **Signature FX layer `fx.js` (2026-06-27, v=18).** User asked to use Skiper UI / Vengeance UI / AnimMaster to make it "one of a kind." Those are React/Next libs (Skiper, Vengeance) or premium copy-paste; site is vanilla → user said "do what's best but keep the videos and configurator." So built **bespoke native effects**, no framework, films + configurator untouched. `fx.js` (loaded on both pages) adds, all progressive-enhancement w/ reduced-motion + no-WebGL + touch fallbacks:
    - **WebGL venom shader** (raw GLSL fbm, oxblood smoke over obsidian) as fixed `#venom` canvas behind content; `#site` made `background:transparent` so it shows in the "open" sections (banded sections keep their own bg → rhythm). Render scale capped (.85 desktop/.6 mobile), pauses on `document.hidden`.
    - **Custom cursor** (oxblood dot + lagged ring, grows on interactive hover) + **magnetic** pull on `.btn-primary/.btn-ghost/#enterBtn/#cfgBuy/.mh-mark`. Desktop only (`pointer:fine`); `body.has-cursor{cursor:none}`.
    - **Kinetic headlines**: 9 section headings got `class="kinetic"` (kept `data-reveal` as no-JS fallback). fx.js splits each on `<br>` into `.kw>span` lines that mask up (translateY) with per-line stagger.
    - **Loader→home cinematic fade**: `#enterBtn` click → `.page-veil` fade → navigate.
    - CSS for all FX is in styles.css. Headless WebGL warnings are swiftshader-only; real M4 GPU runs clean.

14. **MOLTEN OBSIDIAN COUTURE overhaul (2026-06-27, v=19, ultracode).** User furious that prior passes "look the same / too subtle." Ran a 24-agent Workflow analyzing 59 award sites (Peach Worlds, Active Theory, Resn cornrevolution, Igloo Inc, Cartier W&W, fiddle.digital, anime.js, Terminal Industries…) → playbook saved in the task output. KEY VERDICT: the slop cause is **composition, not effects**. Implemented WAVE 1 (composition), all verified, films+configurator untouched:
    - **Type explosion + broken grid**: display headlines now clamp up to ~230-300px Melodrama, left-bled, ghosted Roman-numeral watermarks (I–VII) per section via `::before`. Long-phrase headlines tiered smaller (v19b) so they wrap clean (no mid-word clip). Appended as "COUTURE OVERHAUL v19/v19b" block at end of styles.css.
    - **Oxblood full-bleed SIGNATURE chamber** (red field) + **bone-white STONES inversion chamber** (parchment, ink type) via locally-redefined `--text/--muted/--blood-2/--line` custom props on `.signature`/`.stones` (children inherit) — the "lights on then slam back" beat.
    - **Oversized LILITH watermark** bled off-frame in footer `::before`.
    - **award.js** (new): Lenis-velocity → image `skewY`+scale momentum + `--vel` CSS var → chromatic-aberration text-shadow on `.kinetic`. home.js now sets `window.lenis`.
    - Self-hosted **GSAP 3.12.5 + ScrollTrigger** in vendor/ (staged; not yet wired — for the planned horizontal collection pin).
    - Cache **v=19** (styles/fonts/config/home.js/fx.js/award.js); configurator.js still v16.
    - **STILL TODO from playbook** (high-impact, not yet built): the SIGNATURE MOMENT = pinned Three.js refractive black-glass obsidian serpent relic (scroll-orbited; baked-turntable fallback); ordered-dither WebGL transitions (loader→home + configurator swap); pinned horizontal-scroll collection; configurator gem-fire sparkle; ritual % preloader→oxblood curtain; ambient audio toggle. Full ranked list in the wf1wg7orm task output / playbook.

15. **WHITE THEME + mock Stripe checkout (2026-06-27, v=20).** User: "make the website white themed" + "mock stripe checkout, EVERYTHING."
    - **White/ivory theme**: appended "WHITE THEME v20" block at end of styles.css — re-redefines `:root` (--ink→ivory, --text→ink, oxblood kept). Disabled the dark venom shader (`#venom{display:none}` + commented `venom()` call in fx.js init). Masthead now `mix-blend-mode:difference` so it auto-reads white-over-film / ink-over-page. The STONES inversion chamber now flips the OTHER way (white site → one DARK obsidian chamber → white). SIGNATURE stays the oxblood field; loader page was already light so it fits.
    - **Mock Stripe checkout** (demo, NO real charge — explicitly a mock): new `checkout.css` + `checkout.js` + `#checkout` markup in home.html. Stripe-hosted-checkout layout: left order-summary panel (configured serpent thumb, price, line item) + right payment form (email, combined card Element with VISA/MC/AMEX marks, MM/YY, CVC, name, country, oxblood "Pay $X", "Secured by stripe"). Flow: configurator **Reserve** → `window.openCheckout(order)` → validate (test card 4242…) → spinner → "Payment received" + `LIL-####` order no. + email. configurator.js exposes `window.closeConfigurator` and Reserve now calls `window.openCheckout` (falls back to old .cfg-done if absent). Card formatting + light Stripe-style validation in checkout.js. Responsive (stacks on mobile). Verified desktop+mobile+success.
    - Cache **v=20** (styles/fonts/config/checkout css; home/configurator/checkout/fx/award js). GSAP+ScrollTrigger still staged-unused.

16. **MAISON STRUCTURE rebuild + menu + image prompts (2026-06-27, v=22).** User: "the website sucks, VOID between hero & serpents, WHERE IS THE MENU, make it brand-full exclusive, check other jewelry sites." Ran a 2nd Workflow (8 agents) analyzing 16 real jewelry houses (Cartier, Tiffany, VCA, Bulgari, Boucheron, Messika, Mejuri, Graff…) → rebuild spec in task `wl9h07neu` output. Diagnosis: void-by-type-scale, imagery starvation (5 of 9 renders unused), no persistent menu, no commerce structure. Implemented (vanilla, films+configurator+checkout+kinetic UNTOUCHED):
    - **MENU**: `menu.js` + `#menu` fullscreen overlay (big Melodrama links 01–05 + Client Care/Contact + image tile) + `#menuBtn`. Real persistent **header** rebuilt to 3-zone: left = Menu + inline nav (>=1000px); center = LILITH wordmark; right = utility icons (search/account/bag) + region + Preorder. Transparent white over hero → solid ivory + dark text on `body.scrolled`. Rotating **announcement bar** above header.
    - **VOID FIX**: cut headline maxima ~45% (incant 300→116, bespoke/sig 260→100, others →80), dropped min-heights/paddings (v21+v22 appends in styles.css).
    - **Deployed the 5 unused renders**: `gold-base`→new **The Serpent / Ouroboros** spotlight (dark, under hero); `rose-base`→incant split; `platinum-base`→story split; `rose-open`+`platinum-open`→signature detail strip + menu tile. Every big headline now paired with an image.
    - **NEW Services & Appointment band** (Private Viewing / Sizing / Engraving / Care + Book-a-viewing). **Footer** expanded to 5 columns + region/currency + legal sub-bar.
    - Cache **v=22** (styles, menu.js). All verified; no JS errors.
    - **IMAGE PROMPTS**: wrote `~/dev/snake-ring/IMAGE-PROMPTS.txt` (15 model-worn/macro prompts + reference-based metal-swap prompts — user attaches the rose-gold model photo, swaps to gold/platinum). User is generating real model-on-hand photos to drop in `site/img/` → then wire them into the splits/spotlight/collection (replace the -base/-open product renders with model shots).

*(Last updated 2026-06-27.)*
