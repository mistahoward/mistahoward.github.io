// Technology to icon mapping service
export interface TechnologyIcon {
  name: string;
  icon: string;
  color?: string;
}

// Technology icon mappings
const TECHNOLOGY_ICONS: Record<string, TechnologyIcon> = {
  // Frontend
  "react": { name: "React", icon: "devicon-react-original", color: "#61DAFB" },
  "vue": { name: "Vue.js", icon: "devicon-vuejs-plain", color: "#4FC08D" },
  "angular": { name: "Angular", icon: "devicon-angularjs-plain", color: "#DD0031" },
  "typescript": { name: "TypeScript", icon: "devicon-typescript-plain", color: "#3178C6" },
  "javascript": { name: "JavaScript", icon: "devicon-javascript-plain", color: "#F7DF1E" },
  "html5": { name: "HTML5", icon: "devicon-html5-plain", color: "#E34F26" },
  "css3": { name: "CSS3", icon: "devicon-css3-plain", color: "#1572B6" },
  "sass": { name: "Sass", icon: "devicon-sass-original", color: "#CC6699" },
  "tailwind": { name: "Tailwind CSS", icon: "devicon-tailwindcss-plain", color: "#06B6D4" },
  "bootstrap": { name: "Bootstrap", icon: "devicon-bootstrap-plain", color: "#7952B3" },
  
  // Backend
  "nodejs": { name: "Node.js", icon: "devicon-nodejs-plain", color: "#339933" },
  "python": { name: "Python", icon: "devicon-python-plain", color: "#3776AB" },
  "java": { name: "Java", icon: "devicon-java-plain", color: "#ED8B00" },
  "csharp": { name: "C#", icon: "devicon-csharp-plain", color: "#239120" },
  "php": { name: "PHP", icon: "devicon-php-plain", color: "#777BB4" },
  "go": { name: "Go", icon: "devicon-go-plain", color: "#00ADD8" },
  "rust": { name: "Rust", icon: "devicon-rust-plain", color: "#000000" },
  
  // Databases
  "postgresql": { name: "PostgreSQL", icon: "devicon-postgresql-plain", color: "#336791" },
  "mysql": { name: "MySQL", icon: "devicon-mysql-plain", color: "#4479A1" },
  "mongodb": { name: "MongoDB", icon: "devicon-mongodb-plain", color: "#47A248" },
  "sqlite": { name: "SQLite", icon: "devicon-sqlite-plain", color: "#003B57" },
  "redis": { name: "Redis", icon: "devicon-redis-plain", color: "#DC382D" },
  
  // Cloud & DevOps
  "aws": { name: "AWS", icon: "devicon-amazonwebservices-original", color: "#FF9900" },
  "docker": { name: "Docker", icon: "devicon-docker-plain", color: "#2496ED" },
  "kubernetes": { name: "Kubernetes", icon: "devicon-kubernetes-plain", color: "#326CE5" },
  "nginx": { name: "Nginx", icon: "devicon-nginx-original", color: "#009639" },
  "git": { name: "Git", icon: "devicon-git-plain", color: "#F05032" },
  "github": { name: "GitHub", icon: "devicon-github-original", color: "#181717" },
  
  // Frameworks & Tools
  "nextjs": { name: "Next.js", icon: "devicon-nextjs-original", color: "#000000" },
  "nuxt": { name: "Nuxt.js", icon: "devicon-nuxtjs-plain", color: "#00DC82" },
  "express": { name: "Express.js", icon: "devicon-express-original", color: "#000000" },
  "fastapi": { name: "FastAPI", icon: "devicon-fastapi-plain", color: "#009688" },
  "django": { name: "Django", icon: "devicon-django-plain", color: "#092E20" },
  "flask": { name: "Flask", icon: "devicon-flask-plain", color: "#000000" },
  "spring": { name: "Spring", icon: "devicon-spring-plain", color: "#6DB33F" },
  "laravel": { name: "Laravel", icon: "devicon-laravel-plain", color: "#FF2D20" },
  
  // Mobile & Desktop
  "react-native": { name: "React Native", icon: "devicon-react-original", color: "#61DAFB" },
  "flutter": { name: "Flutter", icon: "devicon-flutter-plain", color: "#02569B" },
  "electron": { name: "Electron", icon: "devicon-electron-original", color: "#47848F" },
  
  // Testing & Build Tools
  "jest": { name: "Jest", icon: "devicon-jest-plain", color: "#C21325" },
  "webpack": { name: "Webpack", icon: "devicon-webpack-plain", color: "#8DD6F9" },
  "vite": { name: "Vite", icon: "devicon-vite-plain", color: "#646CFF" },
  "eslint": { name: "ESLint", icon: "devicon-eslint-original", color: "#4B32C3" },
  "prettier": { name: "Prettier", icon: "devicon-prettier-plain", color: "#F7B93E" }
};

export class TechnologyService {
  /**
   * Get icon information for a technology
   */
  static getTechnologyIcon(technology: string): TechnologyIcon | null {
    const normalizedTech = technology.toLowerCase().trim();
    return TECHNOLOGY_ICONS[normalizedTech] || null;
  }

  /**
   * Get icon information for multiple technologies
   */
  static getTechnologyIcons(technologies: string[]): TechnologyIcon[] {
    return technologies
      .map(tech => this.getTechnologyIcon(tech))
      .filter((icon): icon is TechnologyIcon => icon !== null);
  }

  /**
   * Get all available technologies
   */
  static getAllTechnologies(): TechnologyIcon[] {
    return Object.values(TECHNOLOGY_ICONS);
  }

  /**
   * Check if a technology has an icon mapping
   */
  static hasIcon(technology: string): boolean {
    const normalizedTech = technology.toLowerCase().trim();
    return normalizedTech in TECHNOLOGY_ICONS;
  }

  /**
   * Add a custom technology icon mapping
   */
  static addCustomTechnology(technology: string, icon: TechnologyIcon): void {
    const normalizedTech = technology.toLowerCase().trim();
    TECHNOLOGY_ICONS[normalizedTech] = icon;
  }
} 