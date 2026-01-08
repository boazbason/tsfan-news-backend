// Auto-generated shared types for frontend consumption
// Converted from prisma/schema.prisma (DateTime -> string)

export enum Role {
  USER = "USER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: Role;
  createdAt: string; // ISO date
  posts?: Post[];
  comments?: Comment[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  posts?: Post[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured: boolean;
  image: string | null;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: User;
  categoryId: string | null;
  category?: Category | null;
  comments?: Comment[];
  ads?: Ad[];
}

export interface Comment {
  id: string;
  content: string;
  approved: boolean;
  createdAt: string;
  authorId: string;
  author?: User;
  postId: string;
  post?: Post;
  parentId: string | null;
  parent?: Comment | null;
  replies?: Comment[];
}

export interface Ad {
  id: string;
  title: string;
  image: string | null;
  url: string | null;
  position: string;
  startAt: string | null;
  endAt: string | null;
  active: boolean;
  clicks: number;
  posts?: Post[];
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}
