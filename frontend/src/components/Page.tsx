import {
    IconMapPinCheck,
    IconRefresh, IconSearch
} from "@tabler/icons-react";
import React, {useContext, useEffect, useRef} from "react";
import {SearchContext} from "../context/Search";
import {ISearchState} from "../interface/Search";
import {Modal} from "./Modal";

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

    const handleRefresh = () => {
        searchState.retrieveResults(searchState.clearFilters(), null);
    }

    return <div className="ribbon ribbon-top bg-orange">
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconRefresh onClick={handleRefresh} />
            </span>
        </button>
    </div>
};

export const NearMeButton = () => {
    const searchState: ISearchState = useContext(SearchContext);
    const [loading, setLoading] = React.useState(false);

    const handleNearMe = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition((position) => {
            searchState.clearFilters();
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                radius_km: 100,
            }
            searchState.retrieveResults([], location);
            searchState.setLocation(location);
            setLoading(false)
        }, (error) => {
            console.log(error);
            setLoading(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        })
    }

    return <div className="ribbon ribbon-top bg-yellow" style={{right: '60px'}}>
        <Modal open={loading} onClose={() => setLoading(false)}>
            <h3 className='mt-3'>Getting your location<span className="animated-dots"></span></h3>
        </Modal>
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconMapPinCheck onClick={handleNearMe}/>
            </span>
        </button>
    </div>
};
