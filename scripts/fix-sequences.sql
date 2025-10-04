-- PostgreSQLのシーケンスをリセットするスクリプト
-- IDの自動採番が壊れた場合に実行してください

-- PostVoteテーブルのシーケンスをリセット
SELECT setval(
    pg_get_serial_sequence('"PostVote"', 'id'),
    COALESCE((SELECT MAX(id) FROM "PostVote"), 1),
    true
);

-- CommentVoteテーブルのシーケンスをリセット
SELECT setval(
    pg_get_serial_sequence('"CommentVote"', 'id'),
    COALESCE((SELECT MAX(id) FROM "CommentVote"), 1),
    true
);

-- PostLikeテーブルのシーケンスをリセット
SELECT setval(
    pg_get_serial_sequence('"PostLike"', 'id'),
    COALESCE((SELECT MAX(id) FROM "PostLike"), 1),
    true
);

-- CommentLikeテーブルのシーケンスをリセット
SELECT setval(
    pg_get_serial_sequence('"CommentLike"', 'id'),
    COALESCE((SELECT MAX(id) FROM "CommentLike"), 1),
    true
);

-- Postテーブルのシーケンスをリセット
SELECT setval(
    pg_get_serial_sequence('"Post"', 'id'),
    COALESCE((SELECT MAX(id) FROM "Post"), 1),
    true
);

-- Commentテーブルのシーケンスをリセット
SELECT setval(
    pg_get_serial_sequence('"Comment"', 'id'),
    COALESCE((SELECT MAX(id) FROM "Comment"), 1),
    true
);
