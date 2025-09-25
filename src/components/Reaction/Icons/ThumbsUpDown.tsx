import Icon from "@mdi/react";
import { mdiThumbUpOutline } from "@mdi/js";
import { mdiThumbDownOutline } from '@mdi/js';

export function ThumbsUpIcon() {
  return (
    <div className="flex items-center gap-1">
      <Icon path={mdiThumbUpOutline} size={1} />
    </div>
  );
}

export function ThumbsDownIcon() {
  return (
    <div className="flex items-center gap-1">
      <Icon path={mdiThumbDownOutline} size={1} />
    </div>
  );
}