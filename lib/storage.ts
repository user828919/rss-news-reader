import { promises as fs } from "fs";
import path from "path";
import { Feed } from "./types";

const dataFile = path.join(process.cwd(), "data", "feeds.json");

export const readFeeds = async (): Promise<Feed[]> => {
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Feed[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const writeFeeds = async (feeds: Feed[]) => {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(feeds, null, 2), "utf-8");
};

export const addFeed = async (feed: Feed) => {
  const feeds = await readFeeds();
  feeds.unshift(feed);
  await writeFeeds(feeds);
  return feeds;
};

export const removeFeed = async (id: string) => {
  const feeds = await readFeeds();
  const nextFeeds = feeds.filter((feed) => feed.id !== id);
  await writeFeeds(nextFeeds);
  return nextFeeds;
};

export const updateFeed = async (id: string, updates: Partial<Feed>) => {
  const feeds = await readFeeds();
  const index = feeds.findIndex((feed) => feed.id === id);
  if (index === -1) {
    return { feeds, feed: null };
  }
  const nextFeed = {
    ...feeds[index],
    ...updates
  };
  const nextFeeds = [...feeds];
  nextFeeds[index] = nextFeed;
  await writeFeeds(nextFeeds);
  return { feeds: nextFeeds, feed: nextFeed };
};
