export function getPostEditRestriction(sourceType: string | null | undefined) {
  if (sourceType === "wordpress") {
    return "WordPress 同步文章為唯讀鏡像，請在主站編輯後再同步。";
  }

  return null;
}
