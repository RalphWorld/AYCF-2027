"use client";

import { useEffect, useState } from "react";

export default function SetupPage() {
  const [checking, setChecking] = useState(true);
  const [alreadySetUp, setAlreadySetUp] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => setAlreadySetUp(!!data.alreadySetUp))
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteKey, adminKey }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not set up.");
      return;
    }
    setDone(true);
  }

  if (checking) return <p className="muted">Checking...</p>;

  if (done) {
    return (
      <div>
        <h1 className="title">Setup Complete</h1>
        <div className="panel">
          <p>
            Your site key and admin key are saved. Go to the homepage and log
            in with the site key you just chose. From the Admin tab (using
            the admin key), you can add groups and manage everything else.
          </p>
          <p className="muted">
            This setup page is now locked and cannot be used again — rotate
            keys from the Admin tab if you ever need to change them.
          </p>
        </div>
      </div>
    );
  }

  if (alreadySetUp) {
    return (
      <div>
        <h1 className="title">Already Set Up</h1>
        <div className="panel">
          <p>
            This site already has a site key and admin key. This page only
            works once, before anything is configured.
          </p>
          <p>
            If you've lost both keys, you'd need to reset the
            <code> site_config </code> row directly in Supabase before this
            page will work again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">First-Time Setup</h1>
      <div className="panel">
        <p className="muted">
          Choose your site-wide key (shared with all group leaders) and your
          admin key (kept only by you). You can change either later from the
          Admin tab.
        </p>
      </div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="panel stack">
        <div className="field">
          <label htmlFor="siteKey">Site-wide key</label>
          <input
            id="siteKey"
            value={siteKey}
            onChange={(e) => setSiteKey(e.target.value)}
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="adminKey">Admin key</label>
          <input
            id="adminKey"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </div>
        <button type="submit" disabled={!siteKey || !adminKey}>
          Save Keys
        </button>
      </form>
    </div>
  );
}
