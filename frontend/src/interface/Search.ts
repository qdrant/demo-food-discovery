export interface ISearchResult {
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string;
}

export interface ISearchFilter extends ISearchResult {
    isPositive: boolean;
}

export interface ISearchLocation {
    latitude: number;
    longitude: number;
    radius_km: number;
}

export interface ISearchState {
    results: ISearchResult[];
    filters: ISearchFilter[];
    location: ISearchLocation|null;
    removeFilter: (filter: ISearchFilter) => ISearchFilter[];
    addFilter: (product: ISearchResult, isPositive: boolean) => ISearchFilter[];
    clearFilters: () => ISearchFilter[];
    textSearch: (query: string|undefined) => void;
    retrieveResults: (filters?: ISearchFilter[]|null, location?: ISearchLocation|null) => void;
    setLocation: (location: ISearchLocation|null) => void;
}

export interface ISearchRequestBody {
    positive: string[];
    negative: string[];
    location?: ISearchLocation;
    query?: string;
    limit?: number;
}
