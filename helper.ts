export const epsilon = 0.000001;

export function ind(size: number, end?: number) {
    if (end === undefined) return [...Array(size).keys()];
    if (end - size === 0) return [] as number[];
    else if (end - size < 0) console.log('Size:', end - size);
    return [...Array(end - size).keys()].map(i => i + size);
}