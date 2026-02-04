export type Feed = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

export type FeedItem = {
  title: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  feedId?: string;
  feedTitle?: string;
};
