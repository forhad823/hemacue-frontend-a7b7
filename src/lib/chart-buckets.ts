/**
 * Time-bucket helpers for dashboard charts: fixed windows of calendar months
 * or Monday-start weeks, plus a fold that assigns arbitrary rows to them.
 * Pure functions — no React, no Recharts, unit-testable.
 */
export interface ChartBucket {
  /** Stable key, matched against `bucketKeyOfMonth` / `bucketKeyOfWeek`. */
  key: string;
  /** Short axis label, e.g. "Oct" or "12 Oct". */
  label: string;
}

const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", { month: "short" });
const WEEK_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const two = (value: number) => String(value).padStart(2, "0");

/** Bucket key for the calendar month containing `date` ("2026-10"). */
export function bucketKeyOfMonth(date: Date): string {
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}`;
}

/** Monday 00:00 (local) of the week containing `date`. */
export function startOfBucketWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

/** Bucket key for the Monday-start week containing `date` ("2026-10-12"). */
export function bucketKeyOfWeek(date: Date): string {
  const start = startOfBucketWeek(date);
  return `${start.getFullYear()}-${two(start.getMonth() + 1)}-${two(start.getDate())}`;
}

/** The last `count` calendar months, oldest first — the last one is the current month. */
export function monthBuckets(count: number, now = new Date()): ChartBucket[] {
  const buckets: ChartBucket[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let taken = 0; taken < count; taken += 1) {
    buckets.unshift({
      key: bucketKeyOfMonth(cursor),
      label: MONTH_LABEL.format(cursor),
    });
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return buckets;
}

/** The last `count` Monday-start weeks, oldest first — the last one contains `now`. */
export function weekBuckets(count: number, now = new Date()): ChartBucket[] {
  const currentWeek = startOfBucketWeek(now);
  const buckets: ChartBucket[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - offset * 7);
    buckets.push({
      key: bucketKeyOfWeek(start),
      label: WEEK_LABEL.format(start),
    });
  }
  return buckets;
}

/**
 * Folds `items` into `buckets` by the key returned from `keyOf`, producing one
 * accumulator per bucket (aligned with `buckets`). Rows whose key is `null` or
 * outside every bucket are dropped, so "last N months" windows stay correct.
 */
export function reduceIntoBuckets<T, A>(
  items: readonly T[],
  buckets: readonly ChartBucket[],
  keyOf: (item: T) => string | null,
  initial: (bucket: ChartBucket) => A,
  accumulate: (accumulator: A, item: T) => A,
): A[] {
  const indexByKey = new Map(
    buckets.map((bucket, index) => [bucket.key, index]),
  );
  const result = buckets.map(initial);
  for (const item of items) {
    const key = keyOf(item);
    if (key === null) continue;
    const bucketIndex = indexByKey.get(key);
    if (bucketIndex === undefined) continue;
    result[bucketIndex] = accumulate(result[bucketIndex], item);
  }
  return result;
}
