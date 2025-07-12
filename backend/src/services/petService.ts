import type { Pet } from "../schema";

export interface PetStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  cuteness: number;
  mischief: number;
}

export interface PetAbility {
  name: string;
  description: string;
  power: number;
}

export class PetService {
  /**
   * Generate random stats for a pet (Pokemon-style)
   */
  static generateStats(species: string): PetStats {
    const baseStats = species === "cat" ? {
      hp: 60,
      attack: 70,
      defense: 50,
      speed: 90,
      cuteness: 85,
      mischief: 95
    } : {
      hp: 80,
      attack: 60,
      defense: 70,
      speed: 60,
      cuteness: 90,
      mischief: 40
    };

    // Add some randomness
    return {
      hp: baseStats.hp + Math.floor(Math.random() * 20),
      attack: baseStats.attack + Math.floor(Math.random() * 20),
      defense: baseStats.defense + Math.floor(Math.random() * 20),
      speed: baseStats.speed + Math.floor(Math.random() * 20),
      cuteness: baseStats.cuteness + Math.floor(Math.random() * 15),
      mischief: baseStats.mischief + Math.floor(Math.random() * 15)
    };
  }

  /**
   * Generate special abilities based on species and personality
   */
  static generateAbilities(species: string, personality: string[]): PetAbility[] {
    const catAbilities = [
      { name: "Stealth Mode", description: "Can disappear for hours and reappear without explanation", power: 85 },
      { name: "Gravity Defiance", description: "Ignores physics when jumping from impossible heights", power: 90 },
      { name: "Laser Pointer Chase", description: "Uncontrollable urge to chase red dots", power: 70 },
      { name: "Box Occupation", description: "Fits perfectly in any container regardless of size", power: 95 },
      { name: "Midnight Zoomies", description: "Random bursts of energy at 3 AM", power: 80 }
    ];

    const dogAbilities = [
      { name: "Unconditional Love", description: "Loves everyone unconditionally, even the mailman", power: 100 },
      { name: "Ball Retrieval", description: "Will fetch anything thrown, even if it's not a ball", power: 85 },
      { name: "Snack Detection", description: "Can hear food packaging from 3 rooms away", power: 90 },
      { name: "Protective Instinct", description: "Guards the house from squirrels and delivery people", power: 75 },
      { name: "Cuddle Master", description: "Expert at finding the most comfortable spot on the couch", power: 95 }
    ];

    const abilities = species === "cat" ? catAbilities : dogAbilities;
    
    // Randomly select 2-3 abilities
    const shuffled = abilities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  /**
   * Calculate total power level
   */
  static calculatePowerLevel(stats: PetStats): number {
    return Object.values(stats).reduce((sum, stat) => sum + stat, 0);
  }

  /**
   * Get pet rarity based on stats
   */
  static getRarity(powerLevel: number): string {
    if (powerLevel >= 500) return "Legendary";
    if (powerLevel >= 450) return "Epic";
    if (powerLevel >= 400) return "Rare";
    if (powerLevel >= 350) return "Uncommon";
    return "Common";
  }

  /**
   * Generate a fun pet description
   */
  static generateDescription(pet: Pet): string {
    const species = pet.species;
    const name = pet.name;
    const breed = pet.breed || "mysterious";
    
    const descriptions = {
      cat: [
        `${name} is a ${breed} cat with a heart of gold and a mind full of mischief.`,
        `This ${breed} feline, ${name}, rules the household with an iron paw.`,
        `${name} the ${breed} cat: professional nap taker and amateur bird watcher.`,
        `Meet ${name}, a ${breed} cat who believes they're the center of the universe (and they're not wrong).`
      ],
      dog: [
        `${name} is a ${breed} dog whose tail never stops wagging and heart never stops loving.`,
        `This ${breed} pup, ${name}, is everyone's best friend and the neighborhood's favorite.`,
        `${name} the ${breed} dog: professional cuddler and amateur squirrel chaser.`,
        `Meet ${name}, a ${breed} dog who thinks every person is their long-lost best friend.`
      ]
    };

    const options = descriptions[species as keyof typeof descriptions] || descriptions.dog;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get evolution stage (for fun)
   */
  static getEvolutionStage(age: number, species: string): string {
    if (species === "cat") {
      if (age < 1) return "Kitten";
      if (age < 3) return "Young Cat";
      if (age < 7) return "Adult Cat";
      if (age < 12) return "Mature Cat";
      return "Wise Elder Cat";
    } else {
      if (age < 1) return "Puppy";
      if (age < 3) return "Young Dog";
      if (age < 7) return "Adult Dog";
      if (age < 10) return "Mature Dog";
      return "Wise Elder Dog";
    }
  }
} 