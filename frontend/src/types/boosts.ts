export type EffectType = "COIN_X2_NEXT_SESSION" | "COIN_X2_TIMED";

export type EffectRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type UserEffect = {
  id: string;
  effectType: EffectType;
  expiresAt?: string | null;
  durationHours?: number | null;
  rolledRarity?: EffectRarity | null;
};

export type BoostItem = {
  id: string;
  name: string;
  description?: string;
  rarity?: EffectRarity;
  cost?: number;
  effectType: EffectType;
  durationHours?: number | null;
  itemType?: "boost";
};

export type InventoryResponse = {
  chests?: unknown[];
  colorDrops?: unknown[];
  colors?: unknown[];
  boosts?: BoostItem[];
  activeEffects?: UserEffect[] | null;
};

export const getTimedBoostRemainingMs = (effect: UserEffect, now = Date.now()) => {
  if (effect.effectType !== "COIN_X2_TIMED" || !effect.expiresAt) return 0;
  return Math.max(0, new Date(effect.expiresAt).getTime() - now);
};

export const formatRemainingHm = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 1000 / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const isLegendaryTimedEffect = (effect: UserEffect) =>
  effect.effectType === "COIN_X2_TIMED" &&
  (effect.rolledRarity === "LEGENDARY" || effect.durationHours === 5);
