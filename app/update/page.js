"use client";

import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  "Not started",
  "En route",
  "At venue",
  "Delayed",
  "Need help",
  "Done",
];

export default function StatusChangerPage() {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [groupKey, setGroupKey] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data.groups || []);
        if (data.groups?.[0]) setGroupId(data.groups[0].id);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!groupId || !groupKey) {
      setError("Pick your group and enter your group's key.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: groupKey, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update status.");
      } else {
        setSuccess("Status updated.");
        setGroupKey("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="title">Update Status</h1>

      {error && <div className="error">{error}</div>}
      {success && (
        <div className="panel" style={{ fontWeight: 700 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel stack">
        <div className="field">
          <label htmlFor="group">Your group</label>
          <select
            id="group"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="status">New status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="groupKey">Your group's 6-digit key</label>
          <input
            id="groupKey"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={groupKey}
            onChange={(e) => setGroupKey(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}
