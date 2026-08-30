"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";

const initialState: AdminLoginState = { error: "" };

export function AdminLoginForm({ isConfigured }: { isConfigured: boolean }) {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="admin-lock"><LockKeyhole size={22} /></span>
        <span className="eyebrow">Private area</span>
        <h1 id="admin-login-title">Visit desk access</h1>
        <p>Enter the admin password to view visitor details and bookings.</p>
        {isConfigured ? (
          <form action={formAction}>
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" required autoFocus aria-describedby={state.error ? "admin-login-error" : undefined} />
            </label>
            {state.error ? <p className="form-error" id="admin-login-error" role="alert">{state.error}</p> : null}
            <button className="primary-button" type="submit" disabled={pending}>
              {pending ? "Checking…" : "Open visit desk"}<span aria-hidden="true">→</span>
            </button>
          </form>
        ) : <p className="form-error" role="alert">Admin access is not configured. Add ADMIN_PASSWORD to the server environment.</p>}
      </section>
    </main>
  );
}
