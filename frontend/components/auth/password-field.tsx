"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordField(
  props: Omit<ComponentProps<typeof Input>, "type">,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-wrap">
      <LockKeyhole className="input-icon" size={17} aria-hidden="true" />
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="auth-input password-input"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id}
        disabled={props.disabled}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </Button>
    </div>
  );
}
