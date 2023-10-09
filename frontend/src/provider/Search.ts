import {ISearchFilter, ISearchLocation, ISearchRequestBody, ISearchResult} from "../interface/Search";
import {useEffect, useState} from "react";

export const SearchContextProvider = () => {
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [filters, setFilters] = useState<ISearchFilter[]>([]);
    const [location, setLocation] = useState<ISearchLocation|null>(null);
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

    const retrieveResults = (f: ISearchFilter[] = filters, l: ISearchLocation|null = location, ns: boolean|null = newStrategy) => {
        const positiveIds = f.filter(f => f.isPositive).map(f => f.productId);
        const negativeIds = f.filter(f => !f.isPositive).map(f => f.productId);

        const body: ISearchRequestBody = {
            "positive": positiveIds,
            "negative": negativeIds,
            "strategy": ns ? "best_score" : "average_vector",
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

    const addFilter = (product: ISearchResult, isPositive: boolean): ISearchFilter[] => {
        const newFilter = {isPositive, ...product};
        const filterExists = filters.some(f => {
            return f.productId === newFilter.productId && f.isPositive === newFilter.isPositive
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

    const textSearch = (query: string = '', l: ISearchLocation|null = location) => {
        const body: ISearchRequestBody = {
            query,
            "positive": [],
            "negative": [],
        }

        if (l) {
            body["location"] = l;
        }

        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                query,
                location: l,
                "positive": [],
                "negative": [],
            })
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

    // Retrieve initial results
    useEffect(() => {
        retrieveResults();
    }, []);

    return {
        results,
        filters,
        location,
        newStrategy,
        addFilter,
        removeFilter,
        clearFilters,
        retrieveResults,
        textSearch,
        setLocation,
        setNewStrategy,
    }
};
