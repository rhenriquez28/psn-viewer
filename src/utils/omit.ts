export function omit<
  TObj extends Record<string, unknown>,
  TKey extends keyof TObj
>(obj: TObj, ...keys: TKey[] | [TKey[]]): Omit<TObj, TKey> {
  const actualKeys: string[] = Array.isArray(keys[0])
    ? (keys[0] as string[])
    : (keys as string[]);

  const newObj: any = Object.create(null);
  for (const key in obj) {
    if (!actualKeys.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
