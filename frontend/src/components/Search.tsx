import React, {useContext} from "react";
import {
    ISearchFilter,
    ISearchResult,
    ISearchState
} from "../interface/Search";
import {
    IconExternalLink,
    IconLocationPin, IconMapPin, IconMapPinSearch, IconPin,
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
import {Modal, ModalBody, ModalFooter, ModalHeader} from "./Modal";
import styled from "styled-components";
import Rating from "./Rating";


const Filter = () => {
    const searchState: ISearchState = useContext(SearchContext);
    const filter: ISearchFilter = useContext(FilterContext);
    const [openInfoModal, setOpenInfoModal] = React.useState(false);

    const handleRemoveFilter = () => {
        searchState.retrieveResults(searchState.removeFilter(filter));
    }

    const filterClass = filter.textQuery ? "bg-white" : filter.isPositive ? "bg-green-lt" : "bg-red-lt";
    const filterModal = filter.product ? <InfoModal info={filter.product} open={openInfoModal} onClose={() => setOpenInfoModal(false)}/> : <></>;
    const filterName = filter.product ? filter.product.productName : filter.textQuery;
    const filterImage = filter.product ? filter.product.productImageUrl : "/placeholder.svg";
    const filterDescription = filter.textQuery && "Text search";
    return (
        <div className="col-sm-2">
            <div className={`card ${filterClass}`}>
                <div className="img-responsive img-responsive-21x9 card-img-top"
                     style={{backgroundImage: `url(${filterImage})`}}></div>
                <div className="card-body cursor-pointer" onClick={() => setOpenInfoModal(!!filter.product)}>
                    <h3 className="small card-title">
                        {filterName}<br/>
                        {filterDescription && <span className="text-muted small">{filterDescription}</span>}
                    </h3>
                </div>
                <div className="ribbon ribbon-top bg-orange cursor-pointer" onClick={handleRemoveFilter}>
                    <button className="switch-icon h-50 remove-filter"
                            data-bs-toggle="switch-icon"
                            style={{fontSize: "2em"}}>
                        <span className="switch-icon-a text-white">
                            <IconTrash/>
                        </span>
                        <span className="switch-icon-b text-white">
                            <IconTrashFilled/>
                        </span>
                    </button>
                </div>
            </div>
            {filterModal}
        </div>
    )
}

const FiltersWrapper = styled.div.attrs(props => ({
    id: props.id,
    className: props.className
}))<{ $className?: string }>`
    border: 2px dashed #e3e6f0;
    border-radius: 0.5rem;
    box-sizing: border-box;
    background: #fff;
    min-height: 180px;
`

export const Filters = () => {
    const searchState: ISearchState = useContext(SearchContext);

    const filters = searchState.filters.map((x, i) => {
        return (
            <FilterContext.Provider key={`filter-provider-${i}`} value={x}>
                <Filter key={`filter-${x.productId}-${i}`}/>
            </FilterContext.Provider>
        )
    });

    return (
      <FiltersWrapper
        id="search-filters"
        className="row row-deck pb-3 mx-0 row-cards mb-4 flex-nowrap scrollable scroll-x">
          {filters}
          {filters.length === 0 && <div className="m-auto text-center">Here we will show your likes and dislikes</div>}
      </FiltersWrapper>
    )
}

const Result = () => {
    const searchState: ISearchState = useContext(SearchContext);
    const result: ISearchResult = useContext(ResultContext);
    const [openInfoModal, setOpenInfoModal] = React.useState(false);

    const handleAddFilter = (product: ISearchResult, isPositive: boolean) => {
        const filters = searchState.addProductFilter(product, isPositive);
        searchState.retrieveResults(filters);
    };

    return <div className="col-sm-3 border-2">
        <div className="card">
            <div className="img-responsive img-responsive-21x9 card-img-top"
                 style={{backgroundImage: `url(${result.productImageUrl})`}}></div>
            <div className="card-body">
                <h3 className="card-title cursor-pointer" onClick={() => setOpenInfoModal(true)}>{result.productName}</h3>
                <p className="text-muted text-truncate small" data-bs-toggle="tooltip"
                   title={result.productDescription}>
                    {result.productDescription}
                </p>
            </div>
            <div className="ribbon ribbon-left mt-2 bg-green cursor-pointer"
                 onClick={() => handleAddFilter(result, true)}>
                <button className="switch-icon h-50 thumbs-up" data-bs-toggle="switch-icon" style={{fontSize: "2em"}}>
                    <span className="switch-icon-a text-white">
                        <IconThumbUp/>
                    </span>
                    <span className="switch-icon-b text-white">
                        <IconThumbUpFilled/>
                    </span>
                </button>
            </div>
            <div className="ribbon ribbon-left mt-6 bg-red cursor-pointer" style={{color: "white"}}
                 onClick={() => handleAddFilter(result, false)}>
                <button className="switch-icon h-50 thumbs-down" data-bs-toggle="switch-icon" style={{fontSize: "2em"}}>
                    <span className="switch-icon-a text-white">
                        <IconThumbDown/>
                    </span>
                    <span className="switch-icon-b text-white">
                        <IconThumbDownFilled/>
                    </span>
                </button>
            </div>
            <InfoModal info={result} open={openInfoModal} onClose={() => setOpenInfoModal(false)}/>
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

interface IInfoModal {
    info: ISearchResult;
    open: boolean;
    onClose: () => void;
}
export const InfoModal: React.FC<IInfoModal> = ({info, open, onClose}) => {

    return (
      <Modal open={open} onClose={onClose}>
          <ModalBody>
              <div className="img-responsive img-responsive-21x9 mb-4"
                   style={{backgroundImage: `url(${info.productImageUrl})`}}></div>
              <h2>{info.productName}</h2>
              <p>{info.productDescription}</p>
              <div className="hr-text hr-text-left">About Restaurant:</div>
              <div className={'row'}>
                  <div className={'col-6'}>

                      <p>Name: {info.productRestaurant.name}</p>

                      {info.productRestaurant.rating &&
                          <p style={{display: "flex", alignItems: "center", lineHeight: '16px'}}>
                            Rating: <Rating value={info.productRestaurant.rating}
                                            style={{marginBottom: '3px', marginLeft: '6px'}}/>
                          </p>
                      }
                  </div>
                  <div className={'col-6'}>

                      <p>Address: {info.productRestaurant.address}</p>
                      <p><a
                        href={`https://www.google.com/maps/search/?api=1&query=${info.productRestaurant.location.latitude},${info.productRestaurant.location.longitude}`}
                        target="_blank" rel="noreferrer"><IconMapPin/> See on Map</a></p>
                  </div>
              </div>


          </ModalBody>
          <ModalFooter>
              <button className="btn btn-link link-secondary" onClick={onClose}>
                  Close
              </button>
          </ModalFooter>
      </Modal>
    )
}
