import { err, ok, Result } from "@/src/core/result";
import { NewProduct, Product, PRODUCT_CATEGORIES } from "@/src/domain/models";
import { VersionedStorage } from "@/src/platform/versioned-storage";
import { ProductTrackingService } from "@/src/services/contracts";
import { isProductList } from "./guards";

const legacyBarrierImage = "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=500&q=80";
const barrierImage = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=500&q=80";

const seedProducts: Product[] = [
  { id: "cosrx-snail", name: "Snail 96 Essence", brand: "COSRX", category: "Skincare", daysLeft: 12, tone: "blue", icon: "S", imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80", description: "Lightweight hydrating essence with snail mucin.", favourite: true, addedAt: "2026-07-31T08:30:00Z" },
  { id: "rare-blush", name: "Soft Pinch Blush", brand: "Rare Beauty", category: "Makeup", daysLeft: 21, tone: "coral", icon: "R", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80", description: "Weightless liquid blush with a soft radiant finish.", favourite: false, addedAt: "2026-07-29T11:00:00Z" },
  { id: "innisfree-uv", name: "Daily UV Defense", brand: "Innisfree", category: "Suncare", daysLeft: 68, tone: "yellow", icon: "I", imageUrl: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=500&q=80", description: "Daily lightweight facial sunscreen.", favourite: true, addedAt: "2026-07-25T09:10:00Z" },
  { id: "krave-barrier", name: "Barrier Cream", brand: "KraveBeauty", category: "Skincare", daysLeft: 94, tone: "green", icon: "K", imageUrl: barrierImage, description: "Comforting moisturiser for a compromised skin barrier.", favourite: false, addedAt: "2026-07-22T17:40:00Z" },
  { id: "ouai-mask", name: "Fine Hair Mask", brand: "OUAI", category: "Haircare", daysLeft: 120, tone: "lilac", icon: "O", imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=500&q=80", description: "Light conditioning treatment for fine hair.", favourite: false, addedAt: "2026-07-18T12:00:00Z" },
  { id: "necessaire-lotion", name: "The Body Lotion", brand: "Nécessaire", category: "Bodycare", daysLeft: 145, tone: "green", icon: "N", imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=500&q=80", description: "Fast-absorbing daily body moisturiser.", favourite: false, addedAt: "2026-07-14T07:50:00Z" },
];

export class LocalProductTrackingService implements ProductTrackingService {
  private readonly storage = new VersionedStorage("shelflife.products", 2, seedProducts, isProductList);

  async list(): Promise<Result<readonly Product[]>> {
    const products = this.storage.read();
    if (!products.ok) return products;
    if (!products.value.some((product) => product.imageUrl === legacyBarrierImage)) return products;
    return this.storage.write(products.value.map((product) => product.imageUrl === legacyBarrierImage ? { ...product, imageUrl: barrierImage } : product));
  }

  async add(input: NewProduct): Promise<Result<Product>> {
    const name = input.name.trim();
    const brand = input.brand.trim();
    if (!name || !brand || !PRODUCT_CATEGORIES.includes(input.category) || !Number.isFinite(input.daysLeft) || input.daysLeft < 1) return err("validation", "Check the product name, brand, category, and expiry.");
    const existing = this.storage.read();
    if (!existing.ok) return existing;
    const product: Product = { ...input, name, brand, id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${name}`, tone: "lilac", icon: brand.slice(0, 1).toUpperCase(), imageUrl: input.imageUrl ?? null, description: input.description?.trim() || `${input.category} product by ${brand}.`, favourite: false, addedAt: new Date().toISOString() };
    const saved = this.storage.write([product, ...existing.value]);
    return saved.ok ? ok(product) : saved;
  }

  async setFavourite(productId: string, favourite: boolean): Promise<Result<Product>> {
    const existing = this.storage.read();
    if (!existing.ok) return existing;
    const product = existing.value.find((item) => item.id === productId);
    if (!product) return err("not_found", "That product is no longer on your shelf.");
    const updated = { ...product, favourite };
    const saved = this.storage.write(existing.value.map((item) => item.id === productId ? updated : item));
    return saved.ok ? ok(updated) : saved;
  }
}
