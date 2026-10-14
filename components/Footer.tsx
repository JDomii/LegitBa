import React from "react";
import { UNIVERSITY_NAME } from "@/components/brand";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs italic text-navy-500 sm:px-6 sm:text-right">
        {UNIVERSITY_NAME} &middot; {APP_NAME}
      </div>
    </footer>
  );
}
