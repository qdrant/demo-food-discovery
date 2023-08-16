export interface ISearchResult {
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string;
}

export interface ISearchFilter extends ISearchResult {
    isPositive: boolean;
}

export interface ISearchState {
    results: ISearchResult[];
    filters: ISearchFilter[];
    removeFilter: (filter: ISearchFilter) => ISearchFilter[];
    addFilter: (product: ISearchResult, isPositive: boolean) => ISearchFilter[];
    clearFilters: () => ISearchFilter[];
    textSearch: (query: string|null) => void;
    retrieveResults: (filters: ISearchFilter[]) => void;
}
