"use client";

import Link from "next/link";
import { ChangeStateButton } from "@/components/states/ChangeStateButton";
import { useSelectedState } from "@/components/states/SelectedStateContext";

const navItems = [
  { href: "/assistant", label: "Ask DMV AI" },
  { href: "/practice", label: "Practice" },
  { href: "/road-test", label: "Road Test" },
  { href: "/experiences", label: "Experiences" },
  { href: "/states", label: "States" },
];

export function Navbar() {
  const { selectedStateCode } = useSelectedState();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            DMV
          </span>
          <span className="hidden text-base font-bold tracking-tight text-slate-950 sm:inline">
            AI Practice Hub
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-2xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 sm:inline-flex">
            {selectedStateCode ? `State: ${selectedStateCode}` : "No state"}
          </span>
          <ChangeStateButton />
        </div>
      </div>
    </header>
  );
}
