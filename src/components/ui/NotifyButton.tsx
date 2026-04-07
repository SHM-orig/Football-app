"use client";

import { Bell } from "lucide-react";
import { useCallback, useState } from "react";

/**
 * Optional browser notifications for goal alerts (demo: permission only).
 * Full FCM push requires NEXT_PUBLIC_FIREBASE_VAPID_KEY and service worker setup.
 */
export function NotifyButton() {
  const [perm, setPerm] = useState<NotificationPermission | "default">("default");

  const request = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPerm("denied");
      return;
    }
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") {
      new Notification("Pitchside", {
        body: "You will receive match alerts when push is configured.",
      });
    }
  }, []);

  return (
    <button
      type="button"
      onClick={request}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] px-3 py-2 text-xs font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
      title="Browser notifications (optional)"
    >
      <Bell className="h-4 w-4" />
      {perm === "granted"
        ? "Notifications on"
        : perm === "denied"
          ? "Blocked in browser"
          : "Enable alerts"}
    </button>
  );
}
