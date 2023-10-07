import {ISearchState} from "../interface/Search";
import React, {useContext} from "react";
import {SearchContext} from "../context/Search";
import {Modal} from "./Modal";
import {IconMapPinCheck, IconMapPinSearch} from "@tabler/icons-react";

export const NearMeIndicator = () => {
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
