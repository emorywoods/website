type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}
