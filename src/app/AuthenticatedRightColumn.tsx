"use client";

import RightColumn from "./RightColumn";

type AuthenticatedRightColumnProps = {
  className?: string;
};

export default function AuthenticatedRightColumn({
  className,
}: AuthenticatedRightColumnProps) {
  return (
    <div className={className}>
      <RightColumn />
    </div>
  );
}
