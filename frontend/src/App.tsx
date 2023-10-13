import "@tabler/core/dist/css/tabler.css";
import "@tabler/core/dist/js/tabler.js";
import './index.css';
import React from "react";
import {Header, RefreshButton, StrategySwitch} from "./components/Page";
import {NearMeButton} from "./components/NearMeButton";
import {TextSearchButton} from "./components/TextSearch";
import {Filters, Results} from "./components/Search";
import {SearchContext} from "./context/Search";
import {ISearchState} from "./interface/Search";
import {SearchContextProvider} from "./provider/Search";


export default function App() {
    // Add classes to body, as required by Tabler
    document.body.classList.add("layout-boxed")
    document.body.classList.add("p-sm-5")
    document.body.classList.add("p-md-5")
    document.body.classList.add("p-lg-5")

    // Set page title
    document.title = "Food Discovery with Qdrant"

    // Initialize search state via context provider
    const searchState: ISearchState = SearchContextProvider();

    return (
        <SearchContext.Provider value={searchState}>
            <div className="page pt-lg-3 pb-lg-3 mb-lg-3 rounded-4">
                <div className="page-wrapper">
                    <Header/>
                </div>
                <div className="page-body">
                    <div className="container-xl">
                        <Filters />

                        <div className="row align-items-center">
                            <div className="col">
                                <h2 className="page-title-lg">Recommendation results</h2>
                                <p>Select food items you like and dislike to improve your search
                                    results.</p>
                            </div>
                            <div className="col-auto ms-auto">
                                <StrategySwitch/>
                            </div>
                        </div>

                        <Results/>
                    </div>
                </div>
                <TextSearchButton/>
                <NearMeButton/>
                <RefreshButton/>
            </div>
        </SearchContext.Provider>
    )
};
