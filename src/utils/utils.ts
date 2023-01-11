export function arr2Obj (
    arr: Array<Record<string, string>>
): Record<string, string> {
    const result = {}

    return result
}

export function debounce (func: Function, delay: number, immediate: boolean = false): Function {
    let timer: number | undefined

    return function (this: unknown, ...args: any[]) {
        const self = this
        if (immediate) {
            func.apply(self, args)
            immediate = false
            return
        }
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(self, args)
        }, delay)
    }
}
