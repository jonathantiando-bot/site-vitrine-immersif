import type { Ingredient } from "@/config/product";

type IconName = Ingredient["icon"] | "brain" | "run" | "recycle" | "arrow";

/** Pictogrammes SVG légers (trait), hérite de currentColor. */
export function Icon({ name, size = 28, className }: { name: IconName; size?: number; className?: string }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "bolt":
      return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>;
    case "molecule":
      return (
        <svg {...p}>
          <circle cx="6" cy="7" r="2.5" /><circle cx="18" cy="7" r="2.5" /><circle cx="12" cy="17" r="2.5" />
          <path d="M8.2 8.3 10.8 15M15.8 8.3 13.2 15M8.5 7h7" />
        </svg>
      );
    case "pill":
      return (
        <svg {...p}>
          <rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" />
          <path d="m9.6 8.6 4.6 6.6" />
        </svg>
      );
    case "leaf":
      return <svg {...p}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19 13 11" /></svg>;
    case "drop":
      return <svg {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></svg>;
    case "fruit":
      return (
        <svg {...p}>
          <circle cx="8.5" cy="15" r="4" /><circle cx="15.5" cy="15" r="4" />
          <path d="M8.5 11c1-4 3-6 6-7M15.5 11c-.5-2-1-4-1-7" />
        </svg>
      );
    case "citrus":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="5" />
          <path d="M12 7v10M7 12h10M8.5 8.5l7 7M15.5 8.5l-7 7" />
        </svg>
      );
    case "shield":
      return <svg {...p}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "brain":
      return (
        <svg {...p}>
          <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z" />
          <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" />
        </svg>
      );
    case "run":
      return (
        <svg {...p}>
          <circle cx="15" cy="4.5" r="1.8" />
          <path d="m9 21 3-6 3 3v4M7 11l3-3 4 1 2 3h3M12 15l-1-6" />
        </svg>
      );
    case "recycle":
      return (
        <svg {...p}>
          <path d="M7 19H4.5a1.8 1.8 0 0 1-1.5-2.7L5.5 12M11 19h8.5a1.8 1.8 0 0 0 1.5-2.7l-1.4-2.4M14 16l-3 3 3 3M8.5 7.6l1.9-3.3a1.8 1.8 0 0 1 3.1 0l4.4 7.6M7.5 12 4.6 10.4l-1 4M18.5 12l-1.1-4 4 1" />
        </svg>
      );
    case "arrow":
      return <svg {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
  }
}
