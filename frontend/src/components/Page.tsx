import {
    IconLocation, IconLocationPin,
    IconMapPin,
    IconMapPinCheck, IconMapPinSearch,
    IconRefresh,
} from "@tabler/icons-react";
import React, {useContext} from "react";
import {SearchContext} from "../context/Search";
import {ISearchState} from "../interface/Search";
import {Modal} from "./Modal";

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

const NerMeIndicator = () => {
    const {location, setLocation, filters, retrieveResults}: ISearchState = useContext(SearchContext);

    return (
      <>
          {location && <div className="status bg-green-lt">Near me: {location.latitude}, {location.longitude}<span
              className="cursor-pointer"
              onClick={() => {
                  setLocation(null);
                  retrieveResults(filters, null);
              }}
              title="Clear location"
          >&#10005;</span></div>}
      </>
    )
}

export const NearMeButton = () => {
    const {setLocation, filters, retrieveResults}: ISearchState = useContext(SearchContext);
    const [loading, setLoading] = React.useState(false);
    const RADIUS = 10; // km

    const handleNearMe = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                radius_km: RADIUS,
            }
            retrieveResults(filters, location);
            setLocation(location);
            setLoading(false)
        }, (error) => {
            console.log(error);
            setLoading(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    }

    return <div className="ribbon ribbon-top bg-blue cursor-pointer" style={{right: '60px'}}
                onClick={handleNearMe} title={'Find near me'}>
        <Modal open={loading} onClose={() => setLoading(false)}>
            <h3 className='mt-3'>
                <IconMapPinSearch/> Getting your location<span className="animated-dots"></span></h3>
        </Modal>
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconMapPinCheck/>
            </span>
        </button>
    </div>
};
