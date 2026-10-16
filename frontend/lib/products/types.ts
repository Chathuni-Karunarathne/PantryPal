import type { MeasurementUnit } from "@/lib/inventory/types";

export type ProductCategory = { id: string; name: string };
export type Product = {
  id: string; name: string; description: string; categoryId: string; categoryName: string;
  sellingPrice: string; active: boolean; hasRecipe: boolean; createdAt: string; updatedAt: string;
};
export type ProductPage = { items: Product[]; page: number; size: number; totalElements: number; totalPages: number };
export type ProductOverview = { totalProducts: number; activeProducts: number; recipes: number };
export type RecipeLine = {
  ingredientId: string; ingredientName: string; quantity: string; unit: MeasurementUnit;
  stockQuantity: string; stockUnit: MeasurementUnit; archived: boolean;
};
export type Recipe = {
  id: string; productId: string; yieldQuantity: string; yieldDescription: string; ingredients: RecipeLine[]; updatedAt: string;
};
