import { err, ok, Result } from "@/src/core/result";
import { BarcodeMatch } from "@/src/domain/models";
import { BarcodeService } from "@/src/services/contracts";

const catalog: Record<string, BarcodeMatch> = {
  "8809572890474": { barcode: "8809572890474", name: "Water Sleeping Mask", brand: "Laneige", category: "Skincare", ingredients: ["Water", "Glycerin", "Squalane", "Fragrance"], imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&q=80", description: "Overnight hydrating gel mask for soft, refreshed skin." },
};

export class LocalBarcodeService implements BarcodeService {
  async lookup(barcode: string): Promise<Result<BarcodeMatch>> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    if (!/^\d{8,14}$/.test(barcode)) return err("validation", "Use an 8–14 digit barcode.");
    const match = catalog[barcode];
    return match ? ok(match) : err("not_found", "We could not find that barcode. You can still add it manually.");
  }
}
