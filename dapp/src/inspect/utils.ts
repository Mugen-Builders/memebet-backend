export function jsonReplacer(key: string, value: any): any {
    return typeof value === 'bigint' ? value.toString() : value;
}