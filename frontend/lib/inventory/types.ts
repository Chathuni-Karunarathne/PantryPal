export type StorageLocation = "PANTRY" | "REFRIGERATOR" | "FREEZER";
export type MeasurementUnit = "G" | "KG" | "ML" | "L" | "PCS";
export type IngredientCategory = "FLOUR_AND_GRAINS" | "DAIRY_AND_EGGS" | "SUGAR_AND_SWEETENERS" | "FRUIT_AND_VEGETABLES" |
  "FATS_AND_OILS" | "SPICES_AND_FLAVOURINGS" | "NUTS_AND_SEEDS" | "MEAT_AND_SEAFOOD" | "OTHER";
export type Ingredient = {
  id: string; name: string; category: IngredientCategory; unit: MeasurementUnit; storageLocation: StorageLocation;
  quantity: string; minimumStock: string; lowStock: boolean; nextExpiryDate: string | null; expiredStock: boolean;
  createdAt: string; updatedAt: string;
};
export type IngredientPage = { items: Ingredient[]; page: number; size: number; totalElements: number; totalPages: number };
export type InventoryOverview = { totalIngredients: number; lowStock: number; outOfStock: number; pantry: number; refrigerator: number; freezer: number };
export type InventoryOptions = { categories: IngredientCategory[]; units: MeasurementUnit[]; storageLocations: StorageLocation[] };
export type IngredientMetadata = Pick<Ingredient, "name" | "category" | "unit" | "storageLocation" | "minimumStock">;
export const unitLabels: Record<MeasurementUnit, string> = { G: "g", KG: "kg", ML: "ml", L: "L", PCS: "pcs" };
export const storageLabels: Record<StorageLocation, string> = { PANTRY: "Pantry", REFRIGERATOR: "Refrigerator", FREEZER: "Freezer" };
export const categoryLabels: Record<IngredientCategory, string> = {
  FLOUR_AND_GRAINS: "Flour & grains", DAIRY_AND_EGGS: "Dairy & eggs", SUGAR_AND_SWEETENERS: "Sugar & sweeteners",
  FRUIT_AND_VEGETABLES: "Fruit & vegetables", FATS_AND_OILS: "Fats & oils", SPICES_AND_FLAVOURINGS: "Spices & flavourings",
  NUTS_AND_SEEDS: "Nuts & seeds", MEAT_AND_SEAFOOD: "Meat & seafood", OTHER: "Other",
};
export function formatQuantity(value: string) {
  const [whole, fraction] = value.split(".");
  const trimmed = fraction?.replace(/0+$/, "");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${trimmed ? `.${trimmed}` : ""}`;
}
export function compatibleUnits(unit: MeasurementUnit, units: MeasurementUnit[]) {
  const group = unit === "G" || unit === "KG" ? ["G", "KG"] : unit === "ML" || unit === "L" ? ["ML", "L"] : ["PCS"];
  return units.filter((candidate) => group.includes(candidate));
}
