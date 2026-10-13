export const PRODUCT_CATEGORIES = ["Skincare", "Makeup", "Haircare", "Bodycare", "Suncare"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = Readonly<{
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  daysLeft: number;
  tone: string;
  icon: string;
  barcode?: string;
  imageUrl: string | null;
  description: string;
  favourite: boolean;
  addedAt: string;
}>;

export type NewProduct = Readonly<{
  name: string;
  brand: string;
  category: ProductCategory;
  daysLeft: number;
  barcode?: string;
  imageUrl?: string | null;
  description?: string;
}>;

export type BarcodeMatch = Readonly<{
  barcode: string;
  name: string;
  brand: string;
  category: ProductCategory;
  ingredients: readonly string[];
  imageUrl: string | null;
  description: string;
}>;

export type IngredientFinding = Readonly<{
  ingredient: string;
  level: "info" | "watch";
  reason: string;
}>;

export type RoutineStep = Readonly<{
  id: string;
  name: string;
  instruction: string;
  complete: boolean;
}>;

export const MAX_ROUTINE_STEPS = 15;

export type Reminder = Readonly<{
  id: string;
  productId: string;
  daysBefore: number;
  enabled: boolean;
}>;

export type CommunityPost = Readonly<{
  id: string;
  author: string;
  body: string;
  likes: number;
}>;

export type Insight = Readonly<{
  id: string;
  title: string;
  body: string;
  category: "Routine" | "Ingredients" | "Shelf care";
  favourite: boolean;
}>;

export type CalendarDay = Readonly<{
  date: string;
  skinStatus: "Calm" | "Glowy" | "Dry" | "Sensitive" | "Unlogged";
  mood: string;
  routineCompleted: number;
  routineTotal: number;
  productsUsed: readonly string[];
  note: string | null;
  isFuture: boolean;
}>;

export type CalendarCheckIn = Readonly<{
  date: string;
  skinStatus: Exclude<CalendarDay["skinStatus"], "Unlogged">;
  mood: string;
  routineCompleted: number;
  routineTotal: number;
  productsUsed: readonly string[];
  note: string | null;
}>;
