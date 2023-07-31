import {createContext} from "react";
import {
    ISearchFilter,
    ISearchResult,
    ISearchState,
} from "../interface/Search";


export const ResultContext = createContext<ISearchResult>({} as ISearchResult);

export const FilterContext = createContext<ISearchFilter>({} as ISearchFilter);

export const SearchContext = createContext<ISearchState>({} as ISearchState);
