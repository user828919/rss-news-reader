import Parser from "rss-parser";
import { FeedItem } from "./types";

const parser = new Parser();

export const fetchFeedItems = async (url: string): Promise<FeedItem[]> => {
  const feed = await parser.parseURL(url);
  return (feed.items ?? []).map((item) => ({
    title: item.title ?? "Untitled",
    link: item.link ?? undefined,
    pubDate: item.pubDate ?? item.isoDate ?? undefined,
    contentSnippet: item.contentSnippet ?? item.content ?? undefined
  }));
};

export const fetchFeedTitle = async (url: string): Promise<string> => {
  const feed = await parser.parseURL(url);
  return feed.title ?? url;
};
