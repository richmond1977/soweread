export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export type FaqItem = {
  question: string;
  answer: string;
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
  categoryId: string;
  authorId: string;
  status: PostStatus;
  publishedAt: string;
  readingMinutes: number;
  views: number;
  comments: number;
  featured: boolean;
  tags: string[];
  faq?: FaqItem[];
  content: string;
  seoTitle: string;
  seoDescription: string;
};

export type CmsContent = {
  authors: Author[];
  categories: Category[];
  posts: Post[];
};
