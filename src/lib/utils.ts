type ClassValue = string | undefined | null | false | ClassValue[];

function flatten(values: ClassValue[]): string[] {
  const result: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (Array.isArray(v)) result.push(...flatten(v));
    else result.push(v);
  }
  return result;
}

export function cn(...classes: ClassValue[]): string {
  return flatten(classes).join(" ");
}
