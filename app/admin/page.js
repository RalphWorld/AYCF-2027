"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/admin")
      .then((res) => res.json())
      .then((data) => setUnlocked(!!data.unlocked))
      .finally(() => setChecking(false));
  }, []);

  async function handleUnlock(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: adminKey }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Wrong admin key.");
      return;
    }
    setUnlocked(true);
  }

  if (checking) return <p className="muted">Loading...</p>;

  if (!unlocked) {
    return (
      <div>
        <h1 className="title">Admin</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleUnlock} className="panel stack">
          <div className="field">
            <label htmlFor="adminKey">Admin key</label>
            <input
              id="adminKey"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">Admin</h1>
      <KeysPanel />
      <GroupsPanel />
      <AnnouncementsPanel />
      <ResourcesPanel />
    </div>
  );
}

// ---------------- Keys ----------------

function KeysPanel() {
  const [siteKey, setSiteKey] = useState("");
  const [adminKeyNew, setAdminKeyNew] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const res = await fetch("/api/admin/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteKey: siteKey || undefined,
        adminKey: adminKeyNew || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not update keys.");
      return;
    }
    setMsg("Keys updated. Share the new site key with group leaders.");
    setSiteKey("");
    setAdminKeyNew("");
  }

  return (
    <div className="panel">
      <div className="panel-title">Site &amp; Admin Keys</div>
      {err && <div className="error">{err}</div>}
      {msg && <p style={{ fontWeight: 700 }}>{msg}</p>}
      <form onSubmit={handleSubmit} className="stack">
        <div className="field">
          <label htmlFor="newSiteKey">New site-wide key (leave blank to keep current)</label>
          <input
            id="newSiteKey"
            value={siteKey}
            onChange={(e) => setSiteKey(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="newAdminKey">New admin key (leave blank to keep current)</label>
          <input
            id="newAdminKey"
            value={adminKeyNew}
            onChange={(e) => setAdminKeyNew(e.target.value)}
          />
        </div>
        <button type="submit">Save Keys</button>
      </form>
    </div>
  );
}

// ---------------- Groups ----------------

function GroupsPanel() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [lastKeyMsg, setLastKeyMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data.groups || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return;
    const res = await fetch("/api/admin/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not add group.");
      return;
    }
    setLastKeyMsg(`${data.group.name} key: ${data.plainKey} — copy this now, it will not be shown again.`);
    setName("");
    load();
  }

  async function handleRotateKey(id) {
    setErr("");
    const res = await fetch(`/api/admin/groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rotate_key" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not rotate key.");
      return;
    }
    setLastKeyMsg(`New key: ${data.plainKey} — copy this now, it will not be shown again.`);
  }

  async function handleDelete(id) {
    setErr("");
    const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error || "Could not delete group.");
      return;
    }
    load();
  }

  async function handleOverrideStatus(id, status) {
    setErr("");
    const res = await fetch(`/api/admin/groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error || "Could not update status.");
      return;
    }
    load();
  }

  return (
    <div className="panel">
      <div className="panel-title">Groups</div>
      {err && <div className="error">{err}</div>}
      {lastKeyMsg && (
        <div className="panel" style={{ fontWeight: 700 }}>
          {lastKeyMsg}
        </div>
      )}

      <form onSubmit={handleAdd} className="hstack" style={{ marginBottom: 16 }}>
        <input
          placeholder="New group name, e.g. Group 13"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add Group</button>
      </form>

      {groups.map((g) => (
        <div className="row" key={g.id} style={{ flexWrap: "wrap", gap: 8 }}>
          <span>
            {g.name} <span className="tag">{g.status}</span>
          </span>
          <div className="hstack">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleOverrideStatus(g.id, e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Override status...</option>
              {["Not started", "En route", "At venue", "Delayed", "Need help", "Done"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
            <button className="secondary" type="button" onClick={() => handleRotateKey(g.id)}>
              Rotate Key
            </button>
            <button className="secondary" type="button" onClick={() => handleDelete(g.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Announcements ----------------

function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [text, setText] = useState("");
  const [isBanner, setIsBanner] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const res = await fetch("/api/announcements");
    const data = await res.json();
    setAnnouncements(data.announcements || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setErr("");
    if (!text.trim()) return;
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, is_live_banner: isBanner }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not post announcement.");
      return;
    }
    setText("");
    setIsBanner(false);
    load();
  }

  async function handleDelete(id) {
    setErr("");
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error || "Could not delete.");
      return;
    }
    load();
  }

  return (
    <div className="panel">
      <div className="panel-title">Announcements &amp; Events</div>
      {err && <div className="error">{err}</div>}

      <form onSubmit={handleAdd} className="stack" style={{ marginBottom: 16 }}>
        <div className="field">
          <label htmlFor="annText">New announcement</label>
          <input
            id="annText"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <label className="hstack" style={{ fontSize: 13, fontWeight: 700 }}>
          <input
            type="checkbox"
            checked={isBanner}
            onChange={(e) => setIsBanner(e.target.checked)}
            style={{ width: "auto" }}
          />
          Pin as "Happening Now" banner
        </label>
        <button type="submit">Post</button>
      </form>

      {announcements.map((a) => (
        <div className="row" key={a.id}>
          <span>
            {a.is_live_banner && <span className="tag">LIVE</span>} {a.text}
          </span>
          <button className="secondary" type="button" onClick={() => handleDelete(a.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------- Resources ----------------

function ResourcesPanel() {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const res = await fetch("/api/resources");
    const data = await res.json();
    setResources(data.resources || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !url.trim()) return;
    const res = await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, category }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not add resource.");
      return;
    }
    setTitle("");
    setUrl("");
    setCategory("");
    load();
  }

  async function handleDelete(id) {
    setErr("");
    const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error || "Could not delete.");
      return;
    }
    load();
  }

  return (
    <div className="panel">
      <div className="panel-title">Resource Hub</div>
      {err && <div className="error">{err}</div>}

      <form onSubmit={handleAdd} className="stack" style={{ marginBottom: 16 }}>
        <div className="field">
          <label htmlFor="resTitle">Title</label>
          <input id="resTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="resUrl">Link URL</label>
          <input id="resUrl" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="resCat">Category</label>
          <input
            id="resCat"
            placeholder="e.g. Schedule, Signage, Forms"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <button type="submit">Add Resource</button>
      </form>

      {resources.map((r) => (
        <div className="row" key={r.id}>
          <span>
            <span className="tag">{r.category}</span> {r.title}
          </span>
          <button className="secondary" type="button" onClick={() => handleDelete(r.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
