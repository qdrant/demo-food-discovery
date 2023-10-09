import {
    IconRefresh,
} from "@tabler/icons-react";
import React, {useContext} from "react";
import {SearchContext} from "../context/Search";
import {NearMeIndicator} from "./NearMeButton";

export const Header = () => {
    return <div className="page-header">
        <div className="container-xl">
            <div className="row align-items-center">
                <div className="col d-flex">
                        <a href="https://qdrant.tech" target="_blank">
                            <img src="/powered_by_qdrant.svg" width={130} alt={'Powered by Qdrant'}/>
                        </a>
                    <div className="d-flex flex-column" style={{marginLeft: '1rem', marginTop: '-3px'}}>
                        <div className="page-pretitle">
                            Semantic search
                        </div>
                        <h2 className="page-title">
                            Food Discovery
                        </h2>
                    </div>
                </div>
                <div className={"col-auto ms-auto"}>
                    <NearMeIndicator/>
                </div>
            </div>
        </div>
    </div>;
};

export const RefreshButton = () => {
    const {setLocation, clearFilters, retrieveResults} = useContext(SearchContext);

    const handleRefresh = () => {
        setLocation(null);
        retrieveResults(clearFilters(), null);
    }

    return <div className="ribbon ribbon-top bg-teal cursor-pointer" onClick={handleRefresh} title="Reset all">
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconRefresh/>
            </span>
        </button>
    </div>
};

export const StrategySwitch = () => {
    const {newStrategy, setNewStrategy, retrieveResults, filters, location} = useContext(SearchContext);

    const handleSwitch = () => {
        setNewStrategy(!newStrategy);
        retrieveResults(filters, location, !newStrategy);
    }

    return <label className="form-check form-switch">
        <input className="form-check-input" type="checkbox" onChange={handleSwitch} checked={newStrategy} />
        <span className="form-check-label">New recommendations algorithm</span>
    </label>
}
