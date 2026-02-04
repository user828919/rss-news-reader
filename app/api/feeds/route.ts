import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addFeed, readFeeds } from "@/lib/storage";
import { fetchFeedTitle } from "@/lib/rss";
import { Feed } from "@/lib/types";

export const GET = async () => {
  const feeds = await readFeeds();
  return NextResponse.json({ feeds });
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const url = (body?.url ?? "").toString().trim();

    if (!url) {
      return NextResponse.json({ error: "Feed URL is required." }, { status: 400 });
    }

    const title = await fetchFeedTitle(url);
    const feed: Feed = {
      id: randomUUID(),
      title,
      url,
      createdAt: new Date().toISOString()
    };

    const feeds = await addFeed(feed);
    return NextResponse.json({ feed, feeds }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Unable to add feed." },
      { status: 500 }
    );
  }
};
