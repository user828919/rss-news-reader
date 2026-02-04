"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Feed = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

type FeedItem = {
  title: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  feedTitle?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function HomePage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeeds = async () => {
    setLoadingFeeds(true);
    setError(null);
    try {
      const response = await fetch("/api/feeds");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load feeds");
      setFeeds(data.feeds ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingFeeds(false);
    }
  };

  const loadItems = async () => {
    setLoadingItems(true);
    setError(null);
    try {
      const response = await fetch("/api/items?all=true");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load items");
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadFeeds();
    loadItems();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">PulseReader</h1>
          <p className="subtitle">Capture the signal from every feed you follow.</p>
        </div>
        <nav className="tabs">
          <Link className="tab active" href="/">
            Read
          </Link>
          <Link className="tab" href="/manage-feeds">
            Manage Feeds
          </Link>
        </nav>
      </header>

      <div className="shell">
        <aside>
          <section className="panel">
            <h2 className="section-title">Feeds</h2>
            <div className="feed-list">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="feed-card"
                >
                  <div className="feed-title">{feed.title}</div>
                  <div className="feed-url">{feed.url}</div>
                  <div className="item-meta">
                    <span className="badge">{new Date(feed.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {!feeds.length && (
                <div className="empty">No feeds yet. Add one from Manage Feeds.</div>
              )}
            </div>
            <button
              className="button secondary"
              onClick={loadFeeds}
              disabled={loadingFeeds}
              style={{ marginTop: 16 }}
            >
              {loadingFeeds ? "Refreshing..." : "Refresh Feeds"}
            </button>
          </section>
        </aside>

        <main className="panel">
          <h2 className="section-title">Latest Items</h2>
          <div>
            <div className="item-meta" style={{ marginBottom: 18 }}>
              <span className="badge">All Feeds</span>
              <button
                className="button secondary"
                onClick={loadItems}
                disabled={loadingItems}
              >
                {loadingItems ? "Loading..." : "Refresh Items"}
              </button>
            </div>
            <div className="items">
              {items.map((item, index) => (
                <article key={`${item.link ?? index}`} className="item-card">
                  <h3 className="item-title">{item.title}</h3>
                  <div className="item-meta">
                    {item.feedTitle && <span className="badge">{item.feedTitle}</span>}
                    {item.pubDate && <span>{formatDate(item.pubDate)}</span>}
                    {item.link && (
                      <a className="button secondary" href={item.link} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    )}
                  </div>
                  {item.contentSnippet && <p>{item.contentSnippet}</p>}
                </article>
              ))}
              {!items.length && !loadingItems && (
                <div className="empty">No items yet. Refresh to fetch the feeds.</div>
              )}
            </div>
          </div>

          {error && <p className="footer-note">{error}</p>}
        </main>
      </div>
    </div>
  );
}
