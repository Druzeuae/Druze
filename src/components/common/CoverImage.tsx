import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cover banner that shows a photo when available and gracefully falls back to
 * a brand gradient if the image is missing or fails to load.
 */
export function CoverImage({
  src,
  gradient = "gradient-brand",
  className,
  overlay = true,
  children,
}: {
  src?: string;
  gradient?: string;
  className?: string;
  overlay?: boolean;
  children?: ReactNode;
}) {
  const [ok, setOk] = useState(true);
  return (
    <div className={cn("relative overflow-hidden", gradient, className)}>
      {src && ok && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {src && ok && overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      )}
      {children}
    </div>
  );
}
