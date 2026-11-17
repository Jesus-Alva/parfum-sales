export default function PerfumePrice({
  perfume,
  large = false,
}: {
  perfume: { price: number; discounted_price?: number; discount_percent?: number };
  large?: boolean;
}) {
  const originalPrice = Number(perfume.price);
  const discountedPrice = Number(perfume.discounted_price ?? originalPrice);
  const discountPercent = Number(perfume.discount_percent ?? 0);
  const hasDiscount = discountPercent > 0 && discountedPrice < originalPrice;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {hasDiscount && (
        <>
          <span className="text-sm text-red-400 line-through decoration-red-400/90">
            ${originalPrice.toFixed(2)}
          </span>
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
            -{discountPercent}%
          </span>
        </>
      )}
      <span className={`${large ? "text-4xl" : "text-lg"} font-semibold ${hasDiscount ? "text-scentia-gold" : "text-gradient-gold"}`}>
        ${discountedPrice.toFixed(2)}
      </span>
    </div>
  );
}
