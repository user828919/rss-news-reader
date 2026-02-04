import { NextResponse } from "next/server";
import { readFeeds } from "@/lib/storage";
import { fetchFeedItems } from "@/lib/rss";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const feedId = searchParams.get("feedId");
    const all = searchParams.get("all") === "true";

    if (!feedId && !all) {
      return NextResponse.json({ error: "feedId is required." }, { status: 400 });
    }

    const feeds = await readFeeds();
    if (all) {
      const results = await Promise.all(
        feeds.map(async (feed) => {
          const items = await fetchFeedItems(feed.url);
          return items.map((item) => ({
            ...item,
            feedId: feed.id,
            feedTitle: feed.title
          }));
        })
      );

      const merged = results.flat();
      merged.sort((a, b) => {
        const dateA = a.pubDate ? Date.parse(a.pubDate) : 0;
        const dateB = b.pubDate ? Date.parse(b.pubDate) : 0;
        return dateB - dateA;
      });

      return NextResponse.json({ items: merged });
    }

    const feed = feeds.find((item) => item.id === feedId);

    if (!feed) {
      return NextResponse.json({ error: "Feed not found." }, { status: 404 });
    }

    const items = await fetchFeedItems(feed.url);
    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        feedId: feed.id,
        feedTitle: feed.title
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Unable to fetch feed items." },
      { status: 500 }
    );
  }
};
