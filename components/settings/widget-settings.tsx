"use client";

import { useState } from "react";
import { defaultWidgetPreferences, widgetRegistry } from "@/components/widgets/widget-registry";

export function WidgetSettings() {
  const [preferences, setPreferences] = useState(defaultWidgetPreferences);

  return (
    <div className="settings-list">
      {widgetRegistry.map((widget) => {
        const preference = preferences.find((item) => item.id === widget.id);
        const visible = preference?.visible ?? false;
        return (
          <label className="setting-row" key={widget.id}>
            <span>
              <strong>{widget.title}</strong>
              <small>{widget.description}</small>
            </span>
            <input
              checked={visible}
              type="checkbox"
              onChange={() => setPreferences((current) => current.map((item) => item.id === widget.id ? { ...item, visible: !item.visible } : item))}
            />
          </label>
        );
      })}
      <p className="inline-status" aria-live="polite">当前开关只用于验证模块结构，接入 Supabase 后会跨设备同步。</p>
    </div>
  );
}
