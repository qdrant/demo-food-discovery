import {
    IconMapPinCheck,
    IconRefresh, IconSearch
} from "@tabler/icons-react";
import React, {useContext, useEffect, useRef} from "react";
import {SearchContext} from "../context/Search";
import {ISearchState} from "../interface/Search";

export const Header = () => {
    return <div className="page-header">
        <div className="container-xl">
            <div className="row align-items-center">
                <div className="col">
                    <div className="page-pretitle">
                        Semantic search
                    </div>
                    <h2 className="page-title">
                        Food Discovery
                    </h2>
                </div>
            </div>
        </div>
    </div>;
};

export const RefreshButton = () => {
    const searchState: ISearchState = useContext(SearchContext);

    return <div className="ribbon ribbon-top bg-orange">
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconRefresh onClick={searchState.clearFilters} />
            </span>
        </button>
    </div>
};

export const NearMeButton = () => {
    const searchState: ISearchState = useContext(SearchContext);

    return <div className="ribbon ribbon-top bg-yellow" style={{right: '60px'}}>
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconMapPinCheck onClick={() => {
                     navigator.geolocation.getCurrentPosition((position) => {
                         console.log(position.coords.latitude, position.coords.longitude);
                         // todo something like this:
                         // searchState.nearMe(position.coords.latitude, position.coords.longitude);
                     }, (error) => {
                         console.log(error);
                     }, {
                         enableHighAccuracy: true,
                         timeout: 5000,
                         maximumAge: 0
                     })
                 }}
                 />
            </span>
        </button>
    </div>
};
