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
    removeFilter: (filter: ISearchFilter) => void;
    addFilter: (product: ISearchResult, isPositive: boolean) => void;
    clearFilters: () => void;
}
