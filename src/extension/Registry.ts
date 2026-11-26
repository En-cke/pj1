import type { Category, Contributions, PluginContext } from "./contracts.js";

export const categories = ["shapes", "commands", "decorators", "attributes"] as const;
const methods = {
  shapes: ["create", "read"],
  commands: ["bind"],
  decorators: ["label"],
  attributes: ["handles", "apply"],
} as const;

export class DuplicateRegistration extends Error {
  constructor(category: Category, name: string) {
    super("duplicate registration: " + category + "/" + name);
  }
}

export class Registry {
  private readonly groups: { [K in Category]: Map<string, Contributions[K]> } = {
    shapes: new Map(), commands: new Map(), decorators: new Map(), attributes: new Map(),
  };

  get<K extends Category>(category: K, name: string): Contributions[K] | undefined {
    return this.groups[category].get(name);
  }

  list<K extends Category>(category: K): readonly Contributions[K][] {
    return [...this.groups[category].values()];
  }

  stage() {
    const staged = new Registry();
    let closed = false;
    let failure: unknown;
    const context: PluginContext = {
      register: (category, implementation) => {
        if (closed) throw new Error("plugin registration is closed");
        try {
          const instance = implementation as unknown as Record<string, unknown> | null;
          const name = instance?.name;
          if (!categories.includes(category) || typeof name !== "string" || name.trim() === "" ||
              !methods[category].every(method => typeof instance?.[method] === "function") ||
              (category === "shapes" && (typeof instance?.svgTag !== "string" || !instance.svgTag)) ||
              (category === "commands" && instance?.help !== undefined && typeof instance.help !== "string")) {
            throw new Error("invalid contribution: " + category);
          }
          if (this.get(category, name) || staged.get(category, name)) {
            throw new DuplicateRegistration(category, name);
          }
          staged.groups[category].set(name, implementation);
        } catch (error) {
          failure ??= error;
          throw error;
        }
      },
    };

    const names = (category: Category) => [...staged.groups[category].keys()].sort();
    const merge = <K extends Category>(category: K) => {
      for (const [name, implementation] of staged.groups[category]) {
        this.groups[category].set(name, implementation);
      }
    };
    return {
      context,
      names,
      check: () => { if (failure) throw failure; },
      commit: () => {
        for (const category of categories) {
          for (const name of names(category)) {
            if (this.get(category, name)) throw new DuplicateRegistration(category, name);
          }
        }
        categories.forEach(merge);
      },
      close: () => { closed = true; },
    };
  }
}
