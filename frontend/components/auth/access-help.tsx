"use client";

import { KeyRound, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AccessHelp({ kind }: { kind: "password" | "account" }) {
  const passwordHelp = kind === "password";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="help-link">
          {passwordHelp ? "Forgot password?" : "Ask your administrator"}
        </Button>
      </DialogTrigger>
      <DialogContent className="access-dialog">
        <div className="dialog-symbol" aria-hidden="true">
          {passwordHelp ? <KeyRound size={23} /> : <UserRoundPlus size={23} />}
        </div>
        <DialogHeader>
          <DialogTitle>
            {passwordHelp ? "Let’s get you back in." : "Your team starts here."}
          </DialogTitle>
          <DialogDescription>
            {passwordHelp
              ? "Contact your business owner or PantryPal administrator for help accessing your account."
              : "PantryPal accounts are created by your business owner or administrator. Ask them to set up your staff account and assign your role."}
          </DialogDescription>
        </DialogHeader>
        <p className="help-note">
          {passwordHelp
            ? "Self-service password reset is not available. Never share your password with anyone."
            : "Already have an account? Use the email address provided by your administrator to sign in."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
