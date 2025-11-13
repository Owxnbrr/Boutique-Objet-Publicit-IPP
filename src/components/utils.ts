// src/utils.ts
export function resolveImageSrc(input: unknown): string {
  if (!input) return "";
  if (Array.isArray(input)) return (input[0] as string) || "";
  if (typeof input === "string") {
    const s = input.trim();
    if (s.startsWith("[")) {
      try {
        const arr = JSON.parse(s);
        if (Array.isArray(arr)) return (arr[0] as string) || "";
      } catch {/* ignore */}
    }
    return s;
  }
  return "";
}

/** Retourne une URL exploitable pour <Image/> ou un placeholder local. */
export function firstImage(images?: string[] | string | null): string {
  const url = resolveImageSrc(images ?? "");
  return url || "/placeholder.jpg";
}
