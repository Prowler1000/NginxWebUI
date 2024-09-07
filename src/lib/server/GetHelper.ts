
export class SearchParamsHelper {
    private searchParams: URLSearchParams;

    public constructor(params: URLSearchParams) {
        this.searchParams = params
    }

    public grab(name: string): string | undefined {
        return this.searchParams.get(name) !== null ? this.searchParams.get(name)! : undefined
    }
}