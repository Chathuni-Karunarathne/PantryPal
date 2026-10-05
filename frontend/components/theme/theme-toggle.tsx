"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="theme-toggle"
          aria-label="Choose color theme"
          title="Choose color theme"
        >
          {/* CSS selects the icon before hydration; the server markup stays stable. */}
          <Sun className="theme-sun" aria-hidden="true" />
          <Moon className="theme-moon" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="theme-menu"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <DropdownMenu.Label className="theme-menu-label">
            APPEARANCE
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={theme ?? "system"}
            onValueChange={setTheme}
            aria-label="Color theme"
          >
            {options.map(({ value, label, icon: Icon }) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="theme-option"
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <DropdownMenu.ItemIndicator className="theme-check">
                  <Check size={15} aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
