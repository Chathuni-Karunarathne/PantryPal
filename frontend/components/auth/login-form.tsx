"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  ArrowRight,
  CircleAlert,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { AccessHelp } from "@/components/auth/access-help";
import { FormField } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LoginCredentials = { email: string; password: string };

type LoginFormProps = {
  /** Connect a client-side REST adapter here when authentication is implemented.
   * The adapter owns successful navigation; rejections receive safe, generic copy.
   */
  onAuthenticate?: (credentials: LoginCredentials) => Promise<void>;
};

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>;

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function LoginForm({ onAuthenticate }: LoginFormProps) {
  // Keep credentials out of a native GET submission before hydration or without JS.
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const inFlight = useRef(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validateField(input: HTMLInputElement) {
    if (input.name === "email") {
      if (!input.value.trim()) return "Enter your email address.";
      if (input.validity.typeMismatch) return "Enter a valid email address.";
    }
    if (input.name === "password" && !input.value)
      return "Enter your password.";
    return undefined;
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    setErrors((current) => ({
      ...current,
      [input.name]: validateField(input),
    }));
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (errors[input.name as keyof LoginCredentials]) {
      setErrors((current) => ({
        ...current,
        [input.name]: validateField(input),
      }));
    }
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setMessage("");
    const form = event.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const password = form.elements.namedItem("password") as HTMLInputElement;
    const nextErrors = {
      email: validateField(email),
      password: validateField(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      (nextErrors.email ? email : password).focus();
      return;
    }

    // Phase 1 has no network request, persistence, delay, or fake session.
    if (!onAuthenticate) {
      setMessage(
        "Sign-in is not available yet. Please try again once your workspace is ready.",
      );
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      await onAuthenticate({
        email: email.value.trim(),
        password: password.value,
      });
    } catch {
      setMessage(
        "We couldn’t sign you in. Check your details and try again. If this continues, contact your administrator.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div id="login" className="login-content" tabIndex={-1}>
      <div className="login-kicker">
        <span className="section-number">01</span>
        <span>YOUR WORKSPACE, AWAITING.</span>
      </div>
      <div className="login-heading">
        <h1 id="login-heading">
          Welcome back<span>.</span>
        </h1>
        <p>
          A fresh day. A clearer picture.
          <br />
          Sign in to your PantryPal workspace.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Sign in"
        aria-busy={submitting}
      >
        <fieldset disabled={!ready || submitting} className="login-fields">
          <legend className="sr-only">Your sign-in details</legend>
          <FormField id="email" label="Email address" error={errors.email}>
            <div className="input-wrap">
              <Mail className="input-icon" size={17} aria-hidden="true" />
              <Input
                className="auth-input"
                id="email"
                name="email"
                type="email"
                placeholder="you@yourbusiness.com"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>
          </FormField>
          <FormField
            id="password"
            label="Password"
            error={errors.password}
            labelAction={<AccessHelp kind="password" />}
          >
            <PasswordField
              id="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={submitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </FormField>
          <Button
            className="sign-in-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle
                  className="loading-spinner"
                  size={18}
                  aria-hidden="true"
                />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign in to your workspace</span>
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </Button>
        </fieldset>
        <div
          className="form-announcement"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message && (
            <p className="form-message">
              <CircleAlert size={17} aria-hidden="true" />
              <span>{message}</span>
            </p>
          )}
          <span className="sr-only">
            {submitting
              ? "Signing in. Please wait."
              : Object.values(errors).filter(Boolean).join(" ")}
          </span>
        </div>
      </form>
      <div className="account-help">
        <span>New to your team’s workspace?</span>
        <AccessHelp kind="account" />
      </div>
      <div className="workspace-note">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>Your workspace. Your team. Everything in its place.</span>
      </div>
      {!ready && (
        <p className="form-message">
          JavaScript is needed to use the sign-in form.
        </p>
      )}
    </div>
  );
}
