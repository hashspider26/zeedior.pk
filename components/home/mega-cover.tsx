import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MegaCoverProps {
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  primaryCtaText?: string | null;
  primaryCtaLink?: string | null;
  secondaryCtaText?: string | null;
  secondaryCtaLink?: string | null;
  bgImage?: string | null;
  mediaType?: string | null;
  mediaUrl?: string | null;
  overlayOpacity?: string;
  align?: "left" | "center" | "right";
  aspectRatio?: string;
  mediaOnly?: boolean;
  showContent?: boolean;
}

export function MegaCover({
  badge,
  title,
  subtitle,
  primaryCtaText = "Shop Now",
  primaryCtaLink = "/shop",
  secondaryCtaText,
  secondaryCtaLink,
  bgImage,
  mediaUrl,
  overlayOpacity = "bg-black/50",
  align = "center",
  aspectRatio = "aspect-[16/9]",
  mediaOnly = false,
  showContent = true,
}: MegaCoverProps) {
  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[align || "center"];

  const activeMediaUrl = mediaUrl || bgImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920";
  const hasContent = !mediaOnly && showContent && (title || badge || subtitle || primaryCtaText);

  return (
    <section className={`relative w-full ${aspectRatio} flex flex-col justify-center md:justify-end p-4 sm:p-8 md:p-12 lg:p-16 overflow-hidden group border-b border-zinc-900 bg-black`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url('${activeMediaUrl}')` }}
      />

      {/* Render Dark Overlay and Text Content ONLY if mediaOnly is false */}
      {hasContent && (
        <>
          {/* Dark Overlay */}
          <div className={`absolute inset-0 ${overlayOpacity} bg-gradient-to-t from-black/90 via-black/40 to-transparent`} />

          {/* Scaled Text Content */}
          <div className={`relative z-10 mx-auto max-w-6xl w-full flex flex-col ${alignmentClasses} text-white space-y-2 sm:space-y-3 md:space-y-4`}>
            {badge && (
              <div>
                <span className="inline-block px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-xs font-black uppercase tracking-[0.25em] bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full">
                  {badge}
                </span>
              </div>
            )}

            {title && (
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] max-w-4xl drop-shadow-md">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-xs sm:text-base md:text-lg lg:text-xl text-zinc-200 font-light max-w-2xl leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                {subtitle}
              </p>
            )}

            <div className="pt-2 sm:pt-4 flex flex-wrap gap-2 sm:gap-4 items-center">
              {primaryCtaText && primaryCtaLink && (
                <Link
                  href={primaryCtaLink}
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-8 sm:py-3.5 bg-white text-zinc-950 font-extrabold text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-zinc-200 hover:tracking-[0.25em] shadow-2xl"
                >
                  {primaryCtaText} <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              )}

              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-8 sm:py-3.5 bg-transparent text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-[0.2em] border border-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-zinc-950 hover:border-white"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
