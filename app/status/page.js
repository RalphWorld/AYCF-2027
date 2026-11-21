"use client";

import { useEffect, useState } from "react";

export default function StatusTrackerPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/groups");
    if (res.ok) {
      const data = await res.json();
      setGroups(data.groups || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="title">Status Tracker</h1>
      <div className="panel">
        <div className="panel-title">All Groups</div>
        {loading && <p className="muted">Loading...</p>}
        {!loading && groups.length === 0 && (
          <p className="muted">No groups set up yet.</p>
        )}
        {groups.map((g) => (
          <div className="row" key={g.id}>
            <span>{g.name}</span>
            <span className="tag">{g.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
