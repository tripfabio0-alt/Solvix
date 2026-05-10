import type { Lang } from "@/lib/i18n";

export function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={() => onChange("pt")}
        aria-label="Português"
        className={`flex items-center gap-1.5 transition-opacity ${lang === "pt" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
      >
        <span className="inline-block h-4 w-6 overflow-hidden rounded-sm" aria-hidden>
          <svg viewBox="0 0 60 42" className="h-full w-full">
            <rect width="60" height="42" fill="#009c3b" />
            <polygon points="30,4 56,21 30,38 4,21" fill="#ffdf00" />
            <circle cx="30" cy="21" r="8" fill="#002776" />
          </svg>
        </span>
        <span className={lang === "pt" ? "text-foreground border-b-2 border-primary pb-0.5" : "text-muted-foreground"}>PT</span>
      </button>
      <button
        onClick={() => onChange("en")}
        aria-label="English"
        className={`flex items-center gap-1.5 transition-opacity ${lang === "en" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
      >
        <span className="inline-block h-4 w-6 overflow-hidden rounded-sm" aria-hidden>
          <svg viewBox="0 0 60 42" className="h-full w-full">
            <rect width="60" height="42" fill="#bd3d44" />
            <g fill="#fff">
              {[1,3,5,7,9,11].map((i)=>(<rect key={i} y={i*3} width="60" height="3" />))}
            </g>
            <rect width="26" height="21" fill="#192f5d" />
          </svg>
        </span>
        <span className={lang === "en" ? "text-foreground border-b-2 border-primary pb-0.5" : "text-muted-foreground"}>EN</span>
      </button>
    </div>
  );
}
