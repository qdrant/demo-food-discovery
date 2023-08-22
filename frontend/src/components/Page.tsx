import {
    IconRefresh,
} from "@tabler/icons-react";
import React, {useContext} from "react";
import {SearchContext} from "../context/Search";
import {NerMeIndicator} from "./NearMeButton";

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
                    <NerMeIndicator/>
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
