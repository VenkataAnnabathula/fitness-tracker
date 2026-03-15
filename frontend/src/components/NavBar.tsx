"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Today",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    href: "/add-meal",
    label: "Meals",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4a4 4 0 008 0V2M12 10v12M6 2v2M18 2v2"/>
      </svg>
    ),
  },
  {
    href: "/add-activity",
    label: "Activity",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="1.5"/>
        <path d="M7 21l3-6 2 2 3-4 3 5M6 13l2-4 4 2 2-4"/>
      </svg>
    ),
  },
  {
    href: "/add-weight",
    label: "Weight",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="12" rx="2"/>
        <path d="M8 8V6a4 4 0 018 0v2"/>
        <line x1="12" y1="13" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {/* Brand — only visible on desktop sidebar */}
      <div className="nav-brand" aria-hidden="true">
        <div className="nav-brand-dot" />
        FitTrack
      </div>

      {NAV_ITEMS.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={`nav-item${pathname === href ? " active" : ""}`}
        >
          <span className="nav-icon" style={{ width: 20, height: 20, display: "flex" }}>
            {icon}
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
