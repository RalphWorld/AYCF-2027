"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Wrong key.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 400, paddingTop: "15vh" }}>
      <h1 className="title">AYCF Logistics</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="stack">
        <div className="field">
          <label htmlFor="key">Site key</label>
          <input
            id="key"
            type="password"
            inputMode="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading || !key}>
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
