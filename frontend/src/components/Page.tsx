import {IconRefresh} from "@tabler/icons-react";
import React, { useContext } from "react";
import {SearchContext} from "../context/Search";
import {ISearchState} from "../interface/Search";

export const Header = () => {
    // TODO: Add a logo
    return <div className="page-header">
        <div className="container-xl">
            <div className="col">
                <div className="page-pretitle">
                    Semantic search
                </div>
                <h2 className="page-title">
                    Food Discovery
                </h2>
            </div>
        </div>
    </div>;
};

export const RefreshButton = () => {
    const searchState: ISearchState = useContext(SearchContext);

    return <div className="ribbon ribbon-left bg-twitter">
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconRefresh onClick={searchState.clearFilters} />
            </span>
        </button>
    </div>
};

