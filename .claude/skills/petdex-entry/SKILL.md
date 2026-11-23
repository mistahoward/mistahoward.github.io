---
name: petdex-entry
description: Write a new Pet Dex entry for one of Jay's pets, with every admin-form field (traits, abilities, stats, description, origin story, favorites) ready to paste, plus the image prompt and cleanup steps for its pixel sprite. Use when Jay types /petdex-entry, adds a new pet to the Pet Dex, or wants to redo a pet's entry or sprite.
---

# Pet Dex entry

Pets are rows in the D1 database, and Jay adds them himself in the admin panel: Konami code, then Enter, then the admin secret, then **Pet Dex → Add New Pet**. Never write to the database or add a migration. The job is to write each field's value for him to paste, in the form's order.

The tone matches the existing 24 pets: a game's dex entry written by a doting owner. It's lighthearted and affectionate, a little mock-heroic, and turns real quirks into "abilities". Stay grounded in what Jay tells you. The traits, abilities and stories are the creative part; the pet's facts are not.

`gemini-gem.md` has Jay's original Gemini gem, word for word, plus an updated version that matches today's form. Use it if he'd rather generate the entry in Gemini.

## 1. Gather

Ask for whatever he hasn't given, in one message:

- A clear photo or two. Look at them: coat, markings, build and expression feed the description, the stats and the sprite.
- Name, nickname(s), species (dog, cat or other), breed, age in years, weight in pounds, color or coat pattern.
- Three or more silly or true facts (habits, fears, crimes, rituals). These become the abilities.
- How and when they came home, and the adoption date.
- Whether the pet is with him now (**Active**) or has passed (**Memorial**, which puts them on the Rainbow Bridge).

## 2. Find the next Dex ID

Dex numbers run across all species in the order pets were added. Read the highest `dexId` from the live API and add one. The API's base URL is `VITE_API_URL` in `frontend/.env.local`, and the route is `GET <VITE_API_URL>/api/pets`. Write it as `#025`, with three digits.

## 3. Write the fields

Output a field-by-field list in this order, each value in its own code block so it's easy to copy:

| Field | What to write |
| --- | --- |
| **Name** | The pet's name. |
| **Species** | `dog`, `cat` or `other`. The site groups dogs under Canine and cats under Feline. |
| **Breed** | As Jay calls it, and a playful aside is fine (an existing one reads "Domestic Shorthair (House Panther Variety)"). Shown under the sprite, cut off with "…" on phones, so lead with the real breed. |
| **Nickname** | One or more, comma-separated (`Koko, Koke`). Shown in quotes under the name. |
| **Dex ID** | From step 2, like `#025`. |
| **Age (years)** | A whole number. The screen shows it as "Lv. 3" ("Max Lv." on the Rainbow Bridge). |
| **Color** | The coat as a short phrase (`Sable Merle`, `Lynx Point`). |
| **Personality Traits** | 3–5 traits in Title Case, as quoted items separated by commas with no brackets: `"Anxiously Affectionate","Born Leader","Devotedly Loyal"`. A JSON array with brackets also works. |
| **Special Abilities** | 2–3 abilities in the same format. Each is `"Move Name: what it does, in one sentence."` The part before the colon becomes the move's name on the Stats page, so make it punchy (`"Velcro Grip: Forms an unbreakable bond with his chosen human, boosting his own defense and their morale."`). Base them on the silly facts. |
| **Favorite Food** | A short phrase, funny if it's true (`Anything his parents are eating`). |
| **Favorite Toy** | A short phrase. |
| **Description** | 2–4 sentences, about 250–450 characters, and no more than 480. The first sentence carries the look and the vibe. A blank line starts a new paragraph. |
| **Origin Story** | How they came home, about 400–600 characters, and no more than 650. Heartwarming and lightly fictionalized, but keep the real facts (where, when, who) as Jay gave them. |
| **Stats (JSON format)** | `{"hp": 65, "attack": 60, "defense": 55, "speed": 50}`: each 1–100, adding up to about 200–280 like the existing pets (195–280). Ground them in breed, size, age and personality. Fast means speed, sturdy or fluffy armor means defense, feisty or loud means attack, and big, resilient or round means HP. Puppies and kittens run lower, prime-age athletes higher. |
| **Adopted Date** | `YYYY-MM-DD`. |
| **Active / Memorial** | Which box to tick. |
| **Pet Image** | The photo, uploaded as is. |
| **Pet Icon** | The sprite from step 4. |

Why the length limits matter: the Pet Dex screen reserves the height of the longest page across every pet, so it never resizes. One description or story far longer than the rest makes everyone's screen taller.

Before handing it over, check that the stats add up and stay within 1–100. Check that every trait and ability is wrapped in quotes with commas between them and no trailing comma.

## 4. The sprite

You can't make images, so write the image prompt and Jay runs it in Gemini. Follow `sprite-prompt.md`:

1. Fill in its prompt template with this pet's species, breed, coat, markings and personality from the photo and facts.
2. Tell him which two images to attach (an existing sprite of the same species as the style reference, plus the photo).
3. Give him the cleanup checklist for turning the result into a crisp 64×64 sprite before he uploads it as the **Pet Icon**.

If the first result misses, the file has follow-up prompts for the usual problems: too detailed, facing the wrong way, soft shading.
