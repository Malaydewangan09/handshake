import { createHash } from "node:crypto";
import type { Json } from "./contract.ts";

/** JSON with sorted keys, so equal values always serialize the same way. */
export function canonical(value: Json): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k] as Json)}`).join(",")}}`;
}

export const equal = (a: Json, b: Json): boolean => canonical(a) === canonical(b);

export const hash = (value: Json): string => createHash("sha256").update(canonical(value)).digest("hex").slice(0, 12);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Replace random UUIDs with stable aliases (uuid-1, uuid-2) so a bundle hashes the same on every run.
 * Equal UUIDs get the same alias, so "same key twice" and "two different keys" stay visible.
 */
export function aliasRandomIds(value: Json, seen = new Map<string, string>()): Json {
  if (typeof value === "string" && UUID.test(value)) {
    if (!seen.has(value)) seen.set(value, `uuid-${seen.size + 1}`);
    return seen.get(value)!;
  }
  if (Array.isArray(value)) return value.map((v) => aliasRandomIds(v, seen));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, aliasRandomIds(v, seen)]));
  }
  return value;
}
