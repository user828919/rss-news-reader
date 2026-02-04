import { NextResponse } from "next/server";
import { removeFeed, readFeeds, updateFeed } from "@/lib/storage";

export const DELETE = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Feed id required." }, { status: 400 });
    }
    const feeds = await removeFeed(id);
    return NextResponse.json({ feeds });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Unable to delete feed." },
      { status: 500 }
    );
  }
};

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  const feeds = await readFeeds();
  const feed = feeds.find((item) => item.id === params.id);
  if (!feed) {
    return NextResponse.json({ error: "Feed not found." }, { status: 404 });
  }
  return NextResponse.json({ feed });
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    const title = (body?.title ?? "").toString().trim();
    const url = (body?.url ?? "").toString().trim();

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required." },
        { status: 400 }
      );
    }

    const result = await updateFeed(params.id, { title, url });
    if (!result.feed) {
      return NextResponse.json({ error: "Feed not found." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Unable to update feed." },
      { status: 500 }
    );
  }
};
