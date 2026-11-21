"use client";

import { useEffect, useMemo, useState } from "react";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => setResources(data.resources || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [resources, query]);

  const grouped = useMemo(() => {
    const map = {};
    for (const r of filtered) {
      map[r.category] = map[r.category] || [];
      map[r.category].push(r);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      <h1 className="title">Resource Hub</h1>

      <div className="field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="e.g. schedule, signage, action plan"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading...</p>}

      {!loading && Object.keys(grouped).length === 0 && (
        <p className="muted">No matching resources.</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div className="panel" key={category}>
          <div className="panel-title">{category}</div>
          {items.map((r) => (
            <div className="row" key={r.id}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.title}
              </a>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
