"use client";

import { useEffect, useState } from "react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/announcements");
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const liveBanner = announcements.find((a) => a.is_live_banner);
  const rest = announcements.filter((a) => a.id !== liveBanner?.id);

  return (
    <div>
      <h1 className="title">Announcements</h1>

      {liveBanner && (
        <div className="banner">
          <div className="banner-label">Happening Now</div>
          <div className="banner-text">{liveBanner.text}</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">Feed</div>
        {loading && <p className="muted">Loading...</p>}
        {!loading && rest.length === 0 && !liveBanner && (
          <p className="muted">No announcements yet.</p>
        )}
        {rest.map((a) => (
          <div className="row" key={a.id}>
            <span>{a.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
