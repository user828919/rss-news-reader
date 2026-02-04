"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Feed = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

export default function ManageFeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [url, setUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFeed = useMemo(
    () => feeds.find((feed) => feed.id === selectedId) ?? null,
    [feeds, selectedId]
  );

  const loadFeeds = async () => {
    setLoadingFeeds(true);
    setError(null);
    try {
      const response = await fetch("/api/feeds");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load feeds");
      setFeeds(data.feeds ?? []);
      if (!selectedId && data.feeds?.length) {
        setSelectedId(data.feeds[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingFeeds(false);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  useEffect(() => {
    if (selectedFeed) {
      setEditTitle(selectedFeed.title);
      setEditUrl(selectedFeed.url);
    } else {
      setEditTitle("");
      setEditUrl("");
    }
  }, [selectedFeed]);

  const handleAddFeed = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    setError(null);
    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to add feed");
      setFeeds(data.feeds ?? []);
      setUrl("");
      if (data.feed?.id) {
        setSelectedId(data.feed.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/feeds/${feedId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to delete feed");
      setFeeds(data.feeds ?? []);
      if (selectedId === feedId) {
        setSelectedId(data.feeds?.[0]?.id ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleUpdateFeed = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFeed) return;
    if (!editTitle.trim() || !editUrl.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/feeds/${selectedFeed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, url: editUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update feed");
      setFeeds(data.feeds ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Manage Feeds</h1>
          <p className="subtitle">Curate the sources that power your reader.</p>
        </div>
        <nav className="tabs">
          <Link className="tab" href="/">
            Read
          </Link>
          <Link className="tab active" href="/manage-feeds">
            Manage Feeds
          </Link>
        </nav>
      </header>

      <div className="shell">
        <aside>
          <section className="panel">
            <h2 className="section-title">Add Feed</h2>
            <form className="form" onSubmit={handleAddFeed}>
              <input
                className="input"
                placeholder="https://example.com/rss"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <button className="button" type="submit">
                Add Feed
              </button>
            </form>
          </section>

          <section className="panel">
            <h2 className="section-title">Feed Details</h2>
            {selectedFeed ? (
              <form className="form" onSubmit={handleUpdateFeed}>
                <input
                  className="input"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="Feed name"
                />
                <input
                  className="input"
                  value={editUrl}
                  onChange={(event) => setEditUrl(event.target.value)}
                  placeholder="https://example.com/rss"
                />
                <div className="item-meta">
                  <span className="badge">
                    Added {new Date(selectedFeed.createdAt).toLocaleDateString()}
                  </span>
                  <button className="button secondary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty">Pick a feed to see details.</div>
            )}
          </section>
        </aside>

        <main className="panel">
          <div className="item-meta" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Your Feeds
            </h2>
            <button className="button secondary" onClick={loadFeeds} disabled={loadingFeeds}>
              {loadingFeeds ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="feed-list">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className={`feed-card ${feed.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(feed.id)}
              >
                <div className="feed-title">{feed.title}</div>
                <div className="feed-url">{feed.url}</div>
                <div className="item-meta">
                  <span className="badge">{new Date(feed.createdAt).toLocaleDateString()}</span>
                  <button
                    className="button danger"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteFeed(feed.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!feeds.length && <div className="empty">No feeds yet. Add one above.</div>}
          </div>

          {error && <p className="footer-note">{error}</p>}
        </main>
      </div>
    </div>
  );
}
