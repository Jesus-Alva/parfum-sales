import { imageUrl } from "@/lib/api";

export default function BrandLabel({
  name,
  logoUrl,
  large = false,
}: {
  name: string;
  logoUrl?: string | null;
  large?: boolean;
}) {
  return (
    <span className={`inline-flex min-w-0 items-center ${large ? "gap-2" : "gap-1.5"}`}>
      {logoUrl && (
        <img
          src={imageUrl(logoUrl)}
          alt=""
          aria-hidden="true"
          className={`${large ? "h-7 max-w-20" : "h-5 max-w-12"} shrink-0 object-contain`}
        />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
