import React, {MouseEventHandler, useContext, useEffect, useRef, useState} from "react";
import {ISearchState} from "../interface/Search";
import {SearchContext} from "../context/Search";
import {IconSearch} from "@tabler/icons-react";
import styled from "styled-components";

interface ITextSearchModal {
  open: boolean;
  onClose: () => void;
}

const StyledTextSearchModal = styled.dialog`
  width: 60vw;
  border: none;

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

const TextSearchModal: React.FC<ITextSearchModal> = ({open, onClose}) => {
  const searchState: ISearchState = useContext(SearchContext);
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: implement
    // searchState.textSearch(query);
    onClose();
    setQuery("");
  }

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
      document.body.classList.add("modal-open"); // prevent bg scroll
      ref.current?.querySelector("input")?.focus();
    } else {
      ref.current?.close();
      document.body.classList.remove("modal-open");
    }
  }, [open]);


  return (
    <StyledTextSearchModal ref={ref} id="textSearchModal">
      <div className="modal-dialog modal-lg" role="form">
        <div className="modal-content">
          <div style={{height: '56px', display: 'flex', alignItems: 'center'}}>
            <h2 className="mb-1">What are you looking for?</h2>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body mt-3">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="text-query"
                placeholder="Salad"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-link link-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary ms-auto" onClick={handleSubmit}>
              Search
            </button>
          </div>
        </div>
      </div>
    </StyledTextSearchModal>
  )
}

export const TextSearchButton = () => {
  const [open, setOpen] = React.useState(false);
  const searchState: ISearchState = useContext(SearchContext);

  return (
    <>
      <div className="ribbon ribbon-top bg-twitter" style={{right: '110px'}}>
        <button className="switch-icon" style={{"fontSize": "2em"}} onClick={() => setOpen(true)}>
            <span className="switch-icon-a text-white">
                 <IconSearch onClick={() => {
                 }}/>
            </span>
        </button>
      </div>

      <TextSearchModal open={open} onClose={() => setOpen(false)}/>
    </>
  );
};

