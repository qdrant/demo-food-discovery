import React, {useContext} from "react";
import {
    ISearchFilter,
    ISearchResult,
    ISearchState
} from "../interface/Search";
import {
    IconThumbDown,
    IconThumbDownFilled,
    IconThumbUp,
    IconThumbUpFilled,
    IconTrash,
    IconTrashFilled
} from "@tabler/icons-react";
import {
    FilterContext,
    ResultContext,
    SearchContext
} from "../context/Search";


const FilterPlaceholder = () => {
    const placeholderImg: string = "https://placehold.co/210x90/ecedef/667382/png?text=%2B";
    return (
        <div className="col-sm-2">
            <div className="card">
                <div
                    className="img-responsive img-responsive-21x9 card-img-top"
                    style={{backgroundImage: `url(${placeholderImg})`}}></div>
                <div className="card-body opacity-40">
                    <h3 className="card-title placeholder cursor-default"></h3>
                </div>
            </div>
        </div>
    );
}


const Filter = () => {
    const searchState: ISearchState = useContext(SearchContext);
    const filter: ISearchFilter = useContext(FilterContext);

    const filterClass = filter.isPositive ? "bg-green-lt" : "bg-red-lt";
    return (
        <div className="col-sm-2">
            <div className={`card ${filterClass}`}>
                <div className="img-responsive img-responsive-21x9 card-img-top"
                     style={{backgroundImage: `url(${filter.productImageUrl})`}}></div>
                <div className="card-body">
                    <h3 className="small card-title">{filter.productName}</h3>
                </div>
                <div className="ribbon ribbon-top bg-orange">
                    <button className="switch-icon h-50 remove-filter"
                            data-bs-toggle="switch-icon"
                            style={{fontSize: "2em"}}
                            onClick={() => searchState.removeFilter(filter)}>
                        <span className="switch-icon-a text-white">
                            <IconTrash/>
                        </span>
                        <span className="switch-icon-b text-white">
                            <IconTrashFilled/>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}


export const Filters = () => {
    const searchState: ISearchState = useContext(SearchContext);

    const filters = searchState.filters.map((x, i) => {
        return (
            <FilterContext.Provider key={`filter-provider-${i}`} value={x}>
                <Filter key={`filter-${x.productId}-${i}`}/>
            </FilterContext.Provider>
        )
    });

    const placeholders = Array(Math.max(0, 6 - searchState.filters.length)).fill(0).map((_, i) =>
        <FilterPlaceholder key={`placeholder-${i}`}/>);

    return (
        <div id="search-filters"
             className="row row-deck row-cards mb-4 flex-nowrap scrollable scroll-x">
            {filters}
            {placeholders}
        </div>
    )
}

const Result = () => {
    const searchState: ISearchState = useContext(SearchContext);
    const result: ISearchResult = useContext(ResultContext);

    return <div className="col-sm-3 border-2">
        <div className="card">
            <div className="img-responsive img-responsive-21x9 card-img-top"
                 style={{backgroundImage: `url(${result.productImageUrl})`}}></div>
            <div className="card-body">
                <h3 className="card-title">{result.productName}</h3>
                <p className="text-muted text-truncate small" data-bs-toggle="tooltip"
                   title={result.productDescription}>
                    {result.productDescription}
                </p>
            </div>
            <div className="ribbon ribbon-left mt-2 bg-green">
                <button className="switch-icon h-50 thumbs-up"
                        data-bs-toggle="switch-icon"
                        style={{fontSize: "2em"}}
                        onClick={() => searchState.addFilter(result, true)}>
                    <span className="switch-icon-a text-white">
                        <IconThumbUp/>
                    </span>
                    <span className="switch-icon-b text-white">
                        <IconThumbUpFilled/>
                    </span>
                </button>
            </div>
            <div className="ribbon ribbon-left mt-6 bg-red" style={{color: "white"}}>
                <button className="switch-icon h-50 thumbs-down"
                        data-bs-toggle="switch-icon"
                        style={{fontSize: "2em"}}
                        onClick={() => searchState.addFilter(result, false)}>
                    <span className="switch-icon-a text-white">
                        <IconThumbDown/>
                    </span>
                    <span className="switch-icon-b text-white">
                        <IconThumbDownFilled/>
                    </span>
                </button>
            </div>
        </div>
    </div>
};

export const Results = () => {
    const searchState: ISearchState = useContext(SearchContext);

    const products = searchState.results.map((x) => (
        <ResultContext.Provider key={`result-context-${x.productId}`} value={x}>
            <Result key={`result-${x.productId}`}/>
        </ResultContext.Provider>
    ));
    return (
        <div id="search-results" className="row row-deck row-cards">
            {products}
        </div>
    )
}