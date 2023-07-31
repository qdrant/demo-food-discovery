import {ISearchFilter, ISearchResult} from "../interface/Search";
import {useEffect, useState} from "react";

export const SearchContextProvider = () => {
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [filters, setFilters] = useState<ISearchFilter[]>([]);

    const retrieveResults = () => {
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
            .then(data => {
                return data.map((d: any) => {
                    return {
                        productId: d.id,
                        productName: d.name,
                        productDescription: d.description,
                        productImageUrl: d.image_url,
                    }
                })
            })
            .then(setResults)
            .catch(error => console.error(error));
    }

    const addFilter = (product: ISearchResult, isPositive: boolean): void => {
        const newFilter = {isPositive, ...product};
        const filterExists = filters.some(f => {
            return f.productId === newFilter.productId && f.isPositive === newFilter.isPositive
        });
        if (filterExists) {
            return;
        }

        setFilters([newFilter, ...filters]);
    }

    const removeFilter = (filter: ISearchFilter): void => {
        const newFilters = filters.filter(f => f !== filter);
        setFilters(newFilters);
    }

    const clearFilters = (): void => {
        setFilters([]);
    }

    // Retrieve results when filters change
    useEffect(() => {
        retrieveResults();
    }, [filters]);

    return {
        results,
        filters,
        addFilter,
        removeFilter,
        clearFilters,
    }

};