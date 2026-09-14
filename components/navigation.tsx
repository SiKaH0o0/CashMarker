"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  CircleDollarSign,
  ReceiptText,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

const items = [
  { href: "/today", label: "今日", icon: CalendarDays },
  { href: "/month", label: "本月", icon: CalendarRange },
  { href: "/dashboard", label: "概览", icon: CircleDollarSign },
  { href: "/bills", label: "账单", icon: ReceiptText },
  { href: "/reports", label: "月报", icon: ChartNoAxesCombined },
  { href: "/settings", label: "设置", icon: Settings },
];

export function Navigation({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  return (
    <div className={clsx("navigation-list", variant === "mobile" && "navigation-list-mobile")}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            className={clsx("navigation-link", active && "navigation-link-active")}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
