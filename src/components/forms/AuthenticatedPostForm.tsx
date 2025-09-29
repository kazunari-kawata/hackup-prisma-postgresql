"use client";

import { useAuthState } from "@/lib/auth/useAuth";
import { submitPostForm } from "@/lib/dao/post";
import { useActionState } from "react";

// ActionStateの型定義（post.tsと同じ）
type ActionState = {
  success: boolean;
  errors: {
    title?: string[];
    content?: string[];
  };
  serverError?: string;
};

type AuthenticatedPostFormProps = {
  children: (props: {
    formAction: (formData: FormData) => void;
    pending: boolean;
    state: ActionState;
  }) => React.ReactNode;
};

export default function AuthenticatedPostForm({
  children,
}: AuthenticatedPostFormProps) {
  const { user, isAuthenticated } = useAuthState();

  // 認証されたユーザーIDを含むServer Action
  const authenticatedSubmitPostForm = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    console.log("AuthenticatedPostForm: submitPostForm called");
    console.log("User:", user);
    console.log("IsAuthenticated:", isAuthenticated);

    if (!isAuthenticated || !user) {
      console.log("AuthenticatedPostForm: User not authenticated");
      return {
        success: false,
        errors: { title: [], content: [] },
        serverError: "ログインが必要です",
      };
    }

    // 実際のログインユーザーIDをformDataに追加
    formData.set("userId", user.uid);
    console.log(
      "AuthenticatedPostForm: Calling submitPostForm with userId:",
      user.uid
    );

    // Server Actionを直接呼び出す（try-catchでラップしない）
    // redirect()は正常な処理なので、例外として扱わない
    return await submitPostForm(prevState, formData);
  };

  const [state, formAction, pending] = useActionState(
    authenticatedSubmitPostForm,
    {
      success: false,
      errors: { title: [], content: [] },
    }
  );

  return children({ formAction, pending, state });
}
