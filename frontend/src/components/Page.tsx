import {
    IconMapPinCheck,
    IconRefresh,
} from "@tabler/icons-react";
import React, {useContext} from "react";
import {SearchContext} from "../context/Search";
import {ISearchState} from "../interface/Search";
import {Modal} from "./Modal";

const NerMeIndicator = () => {
    const {location, setLocation, filters, retrieveResults}: ISearchState = useContext(SearchContext);

    return (
      <>
          {location && <div className="status status-yellow">Near me <span
              className="cursor-pointer"
              onClick={() => {
                  setLocation(null);
                  retrieveResults(filters, null);
              }}
          >&#10005;</span></div>}
      </>
    )
}

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

    return <div className="ribbon ribbon-top bg-orange">
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconRefresh onClick={handleRefresh}/>
            </span>
        </button>
    </div>
};

export const NearMeButton = () => {
    const {setLocation, clearFilters, retrieveResults}: ISearchState = useContext(SearchContext);
    const [loading, setLoading] = React.useState(false);

    const handleNearMe = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition((position) => {
            clearFilters();
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                radius_km: 100,
            }
            retrieveResults([], location);
            setLocation(location);
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
