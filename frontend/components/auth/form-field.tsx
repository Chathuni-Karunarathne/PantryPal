import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  labelAction?: ReactNode;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  labelAction,
  children,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <div className="field-label-row">
        <label htmlFor={id}>{label}</label>
        {labelAction}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
