"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleToggle } from "@/components/RoleToggle";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { LOGO_SRC, UNIVERSITY_NAME } from "@/components/brand";
import { APP_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/verify", label: "Verify" },
  { href: "/stamp", label: "Stamp" },
  { href: "/queue", label: "Queue" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          {/* Logo: the supplied PNG, served as-is (unoptimized = no re-encoding) */}
          <Link href="/" className="mr-auto flex items-center gap-3 md:mr-0">
            <Image
              src={LOGO_SRC}
              alt=""
              width={1254}
              height={1254}
              unoptimized
              priority
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
            />
            <span className="leading-tight">
              <span className="block text-base font-extrabold text-maroon-800 sm:text-lg">
                {APP_NAME}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-navy-500 sm:text-xs">
                {UNIVERSITY_NAME}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-navy-900 transition-colors duration-200 hover:bg-surface md:hidden"
          >
            {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>

          <nav
            id="site-nav"
            aria-label="Main"
            className={`order-last grid w-full transition-all duration-300 ease-out md:visible md:order-none md:mx-auto md:w-auto md:grid-rows-[1fr] md:opacity-100 ${
              menuOpen
                ? "visible grid-rows-[1fr] opacity-100"
                : "invisible grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden md:overflow-visible">
              <div className="flex flex-col gap-1 md:flex-row md:gap-2">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex min-h-11 items-center px-3 text-sm font-semibold transition-colors duration-200 md:px-4 ${
                        active ? "text-maroon-700" : "text-navy-700 hover:text-maroon-700"
                      }`}
                    >
                      {link.label}
                      {/* underline grows from the centre on hover and stays on the active page */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3 bottom-0 h-0.5 origin-center rounded bg-maroon-700 transition-transform duration-300 ease-out md:inset-x-4 ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="w-full md:ml-auto md:w-auto">
            <RoleToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
