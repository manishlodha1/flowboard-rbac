'use client';

import { FormEvent, useState } from 'react';
import { Button } from './Button';
import { FieldError, Input, Label, Select, Textarea } from './Field';

export type FormField = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
};

/** Reusable form renderer to avoid duplicating field markup. */
export function FormBuilder({
  fields,
  submitLabel,
  onSubmit,
  initialValues,
}: {
  fields: FormField[];
  submitLabel: string;
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    fields.forEach((f) => {
      base[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? '';
    });
    return base;
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.name}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
            />
          ) : field.type === 'select' ? (
            <Select
              id={field.name}
              required={field.required}
              value={values[field.name]}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
            >
              {(field.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              id={field.name}
              type={field.type ?? 'text'}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <FieldError message={error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Please wait…' : submitLabel}
      </Button>
    </form>
  );
}
