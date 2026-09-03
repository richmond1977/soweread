export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export type FaqItem = {
  question: string;
  answer: string;
};

export type SourceItem = {
  label: string;
  url?: string;
};

export type Author = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "author";
  bio: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  categoryId: string;
  authorId: string;
  status: PostStatus;
  publishedAt: string;
  contentUpdatedAt?: string;
  updatedAt?: string;
  readingMinutes: number;
  views: number;
  comments: number;
  featured: boolean;
  tags: string[];
  faq?: FaqItem[];
  showFaq?: boolean;
  sources?: SourceItem[];
  sourceType?: "native" | "wordpress";
  sourceCanonicalUrl?: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

export type CmsContent = {
  authors: Author[];
  categories: Category[];
  posts: Post[];
};
