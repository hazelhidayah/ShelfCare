import { Product, RoutineStep } from "@/src/domain/models";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const isProductList = (value: unknown): value is Product[] => Array.isArray(value) && value.every((item) =>
  isRecord(item) && typeof item.id === "string" && typeof item.name === "string" && typeof item.brand === "string" &&
  typeof item.category === "string" && typeof item.daysLeft === "number" && item.daysLeft >= 0 &&
  typeof item.tone === "string" && typeof item.icon === "string" && (typeof item.imageUrl === "string" || item.imageUrl === null) &&
  typeof item.description === "string" && typeof item.favourite === "boolean" && typeof item.addedAt === "string"
);

export const isRoutineList = (value: unknown): value is RoutineStep[] => Array.isArray(value) && value.every((item) =>
  isRecord(item) && typeof item.id === "string" && typeof item.name === "string" &&
  typeof item.instruction === "string" && typeof item.complete === "boolean"
);
