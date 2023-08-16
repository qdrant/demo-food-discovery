import React, {useContext, useState} from "react";
import {ISearchState} from "../interface/Search";
import {SearchContext} from "../context/Search";
import {IconSearch} from "@tabler/icons-react";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "./Modal";

interface ITextSearchModal {
  open: boolean;
  onClose: () => void;
}

const TextSearchModal: React.FC<ITextSearchModal> = ({open, onClose}) => {
  const searchState: ISearchState = useContext(SearchContext);
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    searchState.clearFilters();
    searchState.textSearch(query);
    onClose();
    setQuery("");
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title={"What are you looking for?"}
        actions={<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>}/>
      <ModalBody>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            name="text-query"
            placeholder="Salad"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </div>
      </ModalBody>

      <ModalFooter>
        <button className="btn btn-link link-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary ms-auto" onClick={handleSubmit}>
          Search
        </button>
      </ModalFooter>
    </Modal>
  )
}

export const TextSearchButton = () => {
  const [open, setOpen] = React.useState(false);
  const searchState: ISearchState = useContext(SearchContext);

  return (
    <>
      <div className="ribbon ribbon-top bg-twitter" style={{right: '110px'}}>
        <button className="switch-icon" style={{"fontSize": "2em"}}>
            <span className="switch-icon-a text-white">
                 <IconSearch onClick={() => setOpen(true)}/>
            </span>
        </button>
      </div>

      <TextSearchModal open={open} onClose={() => setOpen(false)}/>
    </>
  );
};
