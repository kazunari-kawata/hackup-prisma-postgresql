import * as React from "react";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";

type DeleteButtonProps = {
  commentId: number;
  onDelete: () => void;
};

export default function DeleteButton({
  commentId,
  onDelete,
}: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DeleteIcon />}
      color="error"
      onClick={handleDelete}
    >
      削除
    </Button>
  );
}
