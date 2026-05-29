export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

export function buildBoardSlug(artistName: string, title: string) {
  return slugify(`${artistName}-${title}-${Date.now().toString().slice(-6)}`);
}
