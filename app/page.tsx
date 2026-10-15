import React from "react";
import Link from "next/link";
import { APP_NAME, TAGLINE } from "@/lib/constants";
import { UNIVERSITY_NAME } from "@/components/brand";
// import { CampusIllustration } from "@/components/CampusIllustration";
import Image from "next/image";

import {
  ArrowRightIcon,
  SearchIcon,
  ShieldIcon,
  StampIcon,
  UsersIcon,
} from "@/components/Icons";

const FEATURES = [
  {
    href: "/verify",
    title: "Verify an image",
    text: "Check if an image matches an official record.",
    Icon: SearchIcon,
    label: "Verify an image",
  },
  {
    href: "/stamp",
    title: "Stamp an official file",
    text: "Upload a real announcement to create a verified record.",
    Icon: StampIcon,
    label: "Stamp an official file",
  },
  {
    href: "/queue",
    title: "Community queue",
    text: "View and help review reported images.",
    Icon: UsersIcon,
    label: "Community queue",
  },
];

export default function HomePage() {
  return (
    <main>

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-line bg-white">
        {/* Photo fills the section, anchored to the right */}
        <Image
          src="/images/campus-hero.jpg"
          alt="Tarlac State University campus"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-right"
        />

        {/* Desktop: white fades in from the left so text stays readable */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden md:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 0%, #fff 30%, rgba(255,255,255,0.85) 42%, rgba(255,255,255,0) 65%)",
          }}
        />
        {/* Mobile: fade from the top instead, since text and photo overlap */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 md:hidden"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.9) 55%, rgba(255,255,255,0.35) 100%)",
          }}
        />

        <div className="mx-auto flex min-h-[420px] max-w-6xl items-center px-4 py-10 sm:px-6 md:min-h-[470px] md:py-14">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-maroon-700">
              {UNIVERSITY_NAME}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-3 text-2xl font-extrabold text-maroon-700 sm:text-3xl">{TAGLINE}</p>
            <p className="mt-4 max-w-md text-base text-navy-700 sm:text-lg">
              Verify official announcements, check for real records, and help keep our campus informed.
            </p>
          </div>
        </div>
      </section>
      {/* Hero
      <section className="border-b border-line bg-gradient-to-b from-white to-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-maroon-700">
              {UNIVERSITY_NAME}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-3 text-2xl font-extrabold text-maroon-700 sm:text-3xl">{TAGLINE}</p>
            <p className="mt-4 max-w-md text-base text-navy-700 sm:text-lg">
              Verify official announcements, check for real records, and help keep our campus informed.
            </p>
          </div>
          <CampusIllustration className="mx-auto w-full max-w-lg" />
        </div>
      </section> */}

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ href, title, text, Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon-50 text-maroon-700">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="mt-4 text-lg font-extrabold text-navy-900">{title}</span>
                <span className="mt-1 text-sm text-navy-500">{text}</span>
                <span className="mt-auto flex items-center justify-between pt-4 text-sm font-bold text-maroon-700">
                  <span>{label}</span>
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Purpose */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 rounded-2xl border border-line bg-surface p-5 sm:p-6 md:grid-cols-3">
          <div className="flex gap-4 md:col-span-1">
            <ShieldIcon className="h-10 w-10 shrink-0 text-maroon-700" />
            <div>
              <h2 className="text-lg font-extrabold text-navy-900">
                Build a safer and more informed campus.
              </h2>
              <p className="mt-1 text-sm text-navy-700">
                We prove what is real instead of guessing what is fake. Each official file gets a
                digital fingerprint, so anyone can check whether an image matches it exactly.
              </p>
            </div>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-base font-extrabold text-navy-900">Verified Records</h3>
            <p className="mt-1 text-sm text-navy-700">
              Official announcements are stamped by the university and stored securely.
            </p>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-base font-extrabold text-navy-900">Community Review</h3>
            <p className="mt-1 text-sm text-navy-700">
              Everyone can help spot suspicious images by submitting them to the review queue.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
