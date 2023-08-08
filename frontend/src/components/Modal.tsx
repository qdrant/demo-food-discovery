import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import exp from "constants";

export interface IModal {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface IModalHeader {
  title: string;
  actions: React.ReactNode[] | React.ReactNode;
}

export interface IModalBody {
  children: React.ReactNode;
}

export interface IModalFooter {
  children: React.ReactNode;
}

const StyledTextSearchModal = styled.dialog`
  width: 50vw;
  border: none;

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

export const ModalHeader: React.FC<IModalHeader> = ({title, actions}) => {
  return (
    <div style={{height: '56px', display: 'flex', alignItems: 'center'}}>
      <h2 className="mb-1">{title}</h2>
      {Array.isArray(actions) ?
        actions.map((action, i) => {
          return <React.Fragment key={i}>{action}</React.Fragment>
        }) :
        actions
      }
    </div>
  );
}

export const ModalBody: React.FC<IModalBody> = ({children}) => {
  return <div className="modal-body mt-3">
    {children}
  </div>
}

export const ModalFooter: React.FC<IModalFooter> = ({children}) => {
  return <div className="modal-footer">
    {children}
  </div>
}

export const Modal: React.FC<IModal> = ({children, open, onClose}) => {
  const ref = useRef<HTMLDialogElement>(null);

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
    <StyledTextSearchModal ref={ref}>
      <div className="modal-dialog">
        <div className="modal-content">
          {children}
        </div>
      </div>
    </StyledTextSearchModal>
  )
}
