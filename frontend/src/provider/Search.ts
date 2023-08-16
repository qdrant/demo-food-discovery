import {ISearchFilter, ISearchResult} from "../interface/Search";
import {useEffect, useState} from "react";

export const SearchContextProvider = () => {
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [filters, setFilters] = useState<ISearchFilter[]>([]);

    const _mapProductsProperties = (products: any[]): ISearchResult[] => {
        return products.map((product: any) => {
            return {
                productId: product.id,
                productName: product.name,
                productDescription: product.description,
                productImageUrl: product.image_url,
            }
        });
    }

    const retrieveResults = (filters: ISearchFilter[]) => {
        const positiveIds = filters.filter(f => f.isPositive).map(f => f.productId);
        const negativeIds = filters.filter(f => !f.isPositive).map(f => f.productId);

        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "positive": positiveIds,
                "negative": negativeIds,
            })
        }

        fetch("/api/search", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.json());
                }
                return response.json();
            })
            .then(data => _mapProductsProperties(data))
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

    const textSearch = (query: string|null = null) => {

        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                query,
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
          .then(data => _mapProductsProperties(data))
          .then(setResults)
          .catch(error => console.error(error));
    }

    // Retrieve initial results
    useEffect(() => {
        retrieveResults(filters);
    }, []);

    return {
        results,
        filters,
        addFilter,
        removeFilter,
        clearFilters,
        retrieveResults,
        textSearch,
    }
};