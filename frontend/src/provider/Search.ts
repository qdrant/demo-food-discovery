import {
    ISearchFilter,
    ISearchLocation,
    ISearchRequestBody,
    ISearchResult
} from "../interface/Search";
import {useEffect, useState} from "react";


enum SearchStrategy {
    BEST_SCORE = "best_score",
    AVERAGE_VECTOR = "average_vector",
}

export const SearchContextProvider = () => {
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [filters, setFilters] = useState<ISearchFilter[]>([]);
    const [location, setLocation] = useState<ISearchLocation | null>(null);
    const [newStrategy, setNewStrategy] = useState<boolean>(true);

    const _mapProductsProperties = (products: any[]): ISearchResult[] => {
        return products.map((product: any) => {
            return {
                productId: product.id,
                productName: product.name,
                productDescription: product.description,
                productImageUrl: product.image_url,
                productRestaurant: product.restaurant,
            }
        });
    }

    const retrieveResults = (f: ISearchFilter[] = filters, l: ISearchLocation | null = location, ns: boolean | null = newStrategy) => {
        const positiveIds = f.filter(f => f.isPositive && f.product).map(f => f.product?.productId);
        const negativeIds = f.filter(f => !f.isPositive && f.product).map(f => f.product?.productId);
        const queries = f.filter(f => f.textQuery).map(f => f.textQuery);

        const body: ISearchRequestBody = {
            "positive": positiveIds,
            "negative": negativeIds,
            "queries": queries,
            "strategy": ns ? SearchStrategy.BEST_SCORE : SearchStrategy.AVERAGE_VECTOR,
        }

        if (l) {
            body["location"] = l;
        }

        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        }

        fetch("/api/search", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.json());
                }
                return response.json();
            })
            .then(_mapProductsProperties)
            .then(setResults)
            .catch(error => console.error(error));
    }

    const addProductFilter = (product: ISearchResult, isPositive: boolean): ISearchFilter[] => {
        const newFilter = {
            product: product,
            isPositive: isPositive,
        };
        const filterExists = filters.some(f => {
            return f.product && f.product?.productId === newFilter.product.productId && f.isPositive === newFilter.isPositive
        });
        if (filterExists) {
            return filters;
        }

        setFilters([newFilter, ...filters]);
        return [newFilter, ...filters];
    }

    const addTextFilter = (query: string, isPositive: boolean): ISearchFilter[] => {
        const newFilter = {
            textQuery: query,
            isPositive: isPositive,
        };
        const filterExists = filters.some(f => {
            return f.textQuery === newFilter.textQuery && f.isPositive === newFilter.isPositive
        });
        if (filterExists) {
            return filters;
        }

        setFilters([newFilter, ...filters]);
        return [newFilter, ...filters];
    }

    const removeFilter = (filter: ISearchFilter): ISearchFilter[] => {
        const newFilters = filters.filter(f => f !== filter);
        setFilters(newFilters);
        return newFilters;
    }

    const clearFilters = (): [] => {
        setFilters([]);
        return [];
    }

    // Retrieve initial results
    useEffect(() => {
        retrieveResults();
    }, []);

    return {
        results,
        filters,
        location,
        newStrategy,
        addProductFilter,
        addTextFilter,
        removeFilter,
        clearFilters,
        retrieveResults,
        setLocation,
        setNewStrategy,
    }
};
