export interface ISearchRestaurant {
    location: {
        latitude: number;
        longitude: number;
    },
    name: string;
    rating: number;
    slug?: string;
    address?: string;
}

export interface ISearchResult {
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string;
    productRestaurant: ISearchRestaurant;
}

export interface ISearchFilter {
    product?: ISearchResult;
    textQuery?: string;
    isPositive?: boolean;
}

export interface ISearchLocation {
    latitude: number;
    longitude: number;
    radius_km: number;
}

export type Nullable<T> = T | null;

export interface ISearchState {
    results: ISearchResult[];
    filters: ISearchFilter[];
    location?: Nullable<ISearchLocation>;
    newStrategy: boolean;
    removeFilter: (filter: ISearchFilter) => ISearchFilter[];
    addProductFilter: (product: ISearchResult, isPositive: boolean) => ISearchFilter[];
    addTextFilter: (query: string, isPositive: boolean) => ISearchFilter[];
    clearFilters: () => ISearchFilter[];
    retrieveResults: (filters?: ISearchFilter[]|null, location?: ISearchLocation|null, newStrategy?: boolean|null) => void;
    setLocation: (location: Nullable<ISearchLocation>) => void;
    setNewStrategy: (value: boolean) => void;
}

export interface ISearchRequestBody {
    positive?: string[];
    negative?: string[];
    queries?: string[];
    strategy?: string;
    location?: ISearchLocation;
    limit?: number;
}
