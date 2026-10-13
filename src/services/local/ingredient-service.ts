import { ok, Result } from "@/src/core/result";
import { IngredientFinding } from "@/src/domain/models";
import { IngredientService } from "@/src/services/contracts";

const watchList: Record<string, string> = {
  fragrance: "May irritate fragrance-sensitive skin.",
  "retinyl palmitate": "Use with care during pregnancy and with other retinoids.",
  "denatured alcohol": "Can feel drying on a compromised skin barrier.",
};

export class LocalIngredientService implements IngredientService {
  async analyze(ingredients: readonly string[]): Promise<Result<readonly IngredientFinding[]>> {
    const findings = ingredients.map((ingredient) => {
      const reason = watchList[ingredient.toLowerCase()];
      return { ingredient, level: reason ? "watch" as const : "info" as const, reason: reason ?? "No common concern in your current profile." };
    });
    return ok(findings);
  }
}
