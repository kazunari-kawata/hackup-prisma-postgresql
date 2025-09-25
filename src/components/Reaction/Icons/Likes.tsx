import Icon from "@mdi/react";
import { mdiHeartOutline } from "@mdi/js";
import { mdiHeart } from "@mdi/js";

// ライク前のアイコン
export function LikeIcon() {
  return (
    <div>
      <Icon path={mdiHeartOutline} size={1} />
    </div>
  )
}

// ライク後のアイコン
export function LikedIcon() {
  return (
    <div>
      <Icon path={mdiHeart} size={1} />
    </div>
  )
}