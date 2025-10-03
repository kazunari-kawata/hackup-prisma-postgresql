/**
 * 最適化された投稿データの型定義
 */
export type PostWithStats = {
  id: number;
  title: string;
  content: string;
  createdAt: Date | string;
  userId: string;
  user: {
    id: string;
    username: string | null;
    iconUrl: string | null;
  };
  stats: {
    likes: number;
    comments: number;
    upVotes: number;
    downVotes: number;
    userVote: "UP" | "DOWN" | null;
    userLiked: boolean;
  };
};

/**
 * ページネーション情報
 */
export type PaginationInfo = {
  limit: number;
  offset: number;
  total: number;
};

/**
 * 最適化されたAPI レスポンス
 */
export type PostsWithStatsResponse = {
  posts: PostWithStats[];
  pagination: PaginationInfo;
};
