"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="admin-shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24 }}>
      <form className="admin-card admin-form" style={{ width: "min(100%, 420px)" }} action={formAction}>
        <div>
          <h1>後台登入</h1>
          <p style={{ color: "var(--text-light)", marginTop: 8 }}>請輸入管理員帳號與密碼</p>
        </div>

        {error && (
          <p style={{ color: "#c0392b", background: "#fdecea", padding: "10px 14px", borderRadius: 4, fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

        <label>
          Email
          <input type="email" name="email" required autoComplete="email" placeholder="admin@soweread.com" />
        </label>
        <label>
          密碼
          <input type="password" name="password" required autoComplete="current-password" placeholder="••••••••" />
        </label>

        <button className="admin-button" type="submit" disabled={isPending}>
          {isPending ? "登入中…" : "進入後台"}
        </button>
      </form>
    </div>
  );
}
