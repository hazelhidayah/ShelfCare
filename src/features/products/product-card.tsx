"use client";

import { useState } from "react";
import { Product } from "@/src/domain/models";
import { Heart } from "lucide-react";
import Image from "next/image";

export function ProductCard({ product, compact = false, layout = "list", onSelect, onToggleFavourite }: { product: Product; compact?: boolean; layout?: "grid" | "list"; onSelect?: (product: Product) => void; onToggleFavourite?: (product: Product) => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(product.imageUrl) && !imageFailed;

  return (
    <article className={`product-card ${compact ? "compact" : ""} ${layout}`}>
      <button className="product-main" type="button" onClick={() => onSelect?.(product)}>
        <span className={`product-visual ${product.tone} ${showImage ? "has-image" : ""}`} aria-hidden="true">{showImage ? <Image src={product.imageUrl!} alt="" fill sizes={layout === "grid" ? "45vw" : "74px"} unoptimized onError={() => setImageFailed(true)} /> : <><span className="product-cap" /><span>{product.icon}</span></>}</span>
        <span className="product-copy"><span className="eyebrow">{product.brand}</span><strong>{product.name}</strong>{layout === "list" && <small>{product.description}</small>}<span className={`expiry ${product.daysLeft < 30 ? "soon" : ""}`}>{product.daysLeft < 30 ? `${product.daysLeft} days left` : `Good for ${product.daysLeft} days`}</span></span>
        <span className="product-arrow" aria-hidden="true">›</span>
      </button>
      {onToggleFavourite && <button className={`product-favourite ${product.favourite ? "active" : ""}`} type="button" aria-label={product.favourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`} aria-pressed={product.favourite} onClick={() => onToggleFavourite(product)}><Heart fill={product.favourite ? "currentColor" : "none"} aria-hidden="true" /></button>}
    </article>
  );
}
