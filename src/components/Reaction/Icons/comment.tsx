import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import { Comment as MuiCommentIcon } from "@mui/icons-material";

export function CommentIcon() {
  return <CommentOutlinedIcon sx={{ fontSize: "1rem" }} />;
}

export function CommentFilledIcon() {
  return <MuiCommentIcon sx={{ fontSize: "1rem" }} />;
}

// デフォルトエクスポート
export default CommentIcon;
