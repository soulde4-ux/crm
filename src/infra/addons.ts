export type Addon = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  init?: () => void | Promise<void>;
};

// Loads local addons that live in src/addons/index.ts
// This uses a dynamic import so local development addons can be dropped in without
// changing the infra code.
export async function loadLocalAddons(): Promise<Addon[]> {
  try {
    // src/infra is sibling to src/addons, so import '../addons'
    const module = await import('../addons');
    // Support both `export default [...]` and `export const addons = [...]` shapes
    const addons: Addon[] = module.default ?? module.addons ?? [];
    return Array.isArray(addons) ? addons : [];
  } catch (e) {
    // If the file doesn't exist or fails to load, return an empty list.
    console.warn('[infra/addons] could not load local addons', e);
    return [];
  }
}
