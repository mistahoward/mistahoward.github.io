# Pet Dex sprite prompt

How Jay makes a pet's pixel sprite (the **Pet Icon** in the admin form): an image model draws it from a style reference plus a photo of the pet, then he cleans it up into a crisp sprite. The site can't do this step, so it happens before upload.

The original prompt was lost. Jay remembers attaching a 64×64 creature sprite from a Game Boy Advance–era monster-collecting game as the style reference, then a photo of the pet with an explanation of what he wanted. This rebuilds that, aimed at matching the sprites the Pet Dex already has.

## What the existing sprites look like

Match these so a new pet sits naturally next to the other 24:

- **Canvas:** PNG with a transparent background. Most are 61×61 and one is 64×64. The site shows them at 61px in the grid and scales them up 3× on the screen with crisp, nearest-neighbor pixels, so either size works.
- **Pose:** full body, standing, three-quarter front view, **facing left**. The head is upper left, and the body and tail go to the right. The memorial halo sits at about 35% across and 10% down, so a sprite facing right would get its halo over the tail.
- **Framing:** the animal fills most of the canvas, about 52–58px wide, with its feet on the bottom rows and a small dark oval shadow under them.
- **Line and shading:** a dark 1px outline, flat color with 3–4 shades per color, light from the top left. No gradients, no blur and no semi-transparent pixels. About 16–24 colors in all.

## What to attach

1. **Style reference:** one or two existing Pet Dex sprites, ideally of the same species. Arthur (#002) and Casper (#001) work for dogs, Centauri (#010) and Percy (#023) for cats. Save them from the site by right-clicking a pet in the grid. Using the dex's own sprites keeps the set consistent, which is better than the original game-sprite reference now that 24 exist.
2. **The pet:** a clear, well-lit photo showing the whole body and the markings. A side or three-quarter angle helps.

## Prompt template

Fill in the brackets, attach both images, and send it to Gemini or any image model that takes reference images:

```text
Create a pixel-art sprite of my [species], [Name], in exactly the same style as the reference sprite I attached: a 64×64 pixel creature sprite from a Game Boy Advance–era monster-collecting game.

Match the reference sprite exactly in:
- Pose: full body, standing, three-quarter front view, facing LEFT (head on the left side of the image, tail on the right).
- Size and framing: the animal fills most of the 64×64 canvas, feet on the bottom rows, with a small dark oval shadow under the feet.
- Line work: a dark 1-pixel outline around the animal and its main shapes.
- Shading: flat colors with 3–4 shades each, lit from the top left. No gradients, no blur, no anti-aliasing, no dithering.
- Background: one flat solid color, pure magenta (#FF00FF), so it can be removed cleanly.

Draw the animal from the photo: a [breed] with [coat color and pattern]. Keep these features recognizable at sprite size: [markings, e.g. white chest blaze, one ear that flops, fluffy tail, mismatched eyes]. Exaggerate [the most recognizable feature] slightly so it reads at 64 pixels. Expression and stance: [e.g. alert and a little worried, proud, sleepy, mischievous].

Output exactly one sprite, with no text, border, frame or extra characters.
```

## If the first result misses

Reply in the same chat with whichever fits:

- **Too detailed or too smooth:** "Make it chunkier: fewer, larger pixel clusters, fewer colors, as if it really were 64×64 pixels scaled up."
- **Facing the wrong way:** "Same sprite, but turned to face left, with the head on the left side."
- **Soft shading:** "Remove all gradients and soft shading. Use 3–4 flat shades per color with hard edges."
- **Wrong markings:** "Keep everything else, but [the white patch is on the chest, not the face / the tail is short]."
- **Background not flat:** "Make the whole background one flat pure magenta (#FF00FF), with no shadows or texture except the small oval under the feet."

## Cleanup into a crisp sprite

Image models draw "pixel art" at high resolution, and their pixels rarely sit on a clean grid. This is the "make it crisp" step:

1. **Scale down to the sprite grid.** Work out roughly how many output pixels make one sprite pixel (a 1024px image of a 64px sprite is 16 per pixel). Resize to 64×64 with **nearest neighbor**, never bilinear or bicubic. If stray pixels look wrong, try a slightly different size, or resize with "box" first and then fix up by hand.
2. **Remove the background.** Select the magenta with the magic wand at tolerance 0 (non-contiguous) and delete it, so the background is fully transparent.
3. **Reduce the palette** to about 16–24 colors (Indexed color in Photopea, or Color mode in Aseprite). Every pixel should be fully opaque or fully transparent, with nothing in between.
4. **Hand-fix the details:** close any gaps in the outline, fix the eyes (they matter most at this size), keep the feet on the bottom rows and the head on the left, and keep the shadow as a small dark oval.
5. **Size it like the others:** keep it 64×64, or trim to 61×61 with the animal centered and the feet near the bottom.
6. **Check it at 300% zoom** with nearest neighbor, next to an existing sprite. Then export a PNG and upload it as the **Pet Icon**.

Free tools that do all of this: **Photopea** (in the browser: Image → Image Size → Nearest Neighbor, Image → Mode → Indexed Color) and **Pixelorama**. **Aseprite** is the paid favorite for hand fixes.
