import React from 'react'
import {IconStar, IconStarFilled, IconStarHalfFilled, IconStarOff} from "@tabler/icons-react";
import styled from "styled-components";

const RatingWrapper = styled.span.attrs(props => ({
    ...props
}))`
  display: inline-flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  padding: 0;

  & > svg {
    width: 1em;
    height: 1em;
  }
`

const StyledIconStarFilled = styled(IconStarFilled)`
  width: 1em;
  height: 1em;
  color: #ffc107;
`

const StyledIconStarHalfFilled = styled(IconStarHalfFilled)`
    width: 1em;
    height: 1em;
    color: #ffc107;
`

const StyledIconStar = styled(IconStar)`
    width: 1em;
    height: 1em;
    color: #ffc107;
`

const Rating = ({value, style = {}}: RatingProps) => {
    const rating = Math.round(value) / 2;

    return (
      <RatingWrapper style={style}>
          {[...Array(Math.floor(rating))].map((e, i) => <StyledIconStarFilled key={`star-${i}`}/>)}
          {rating % 1 >= 0.5 && <StyledIconStarHalfFilled key={`star-half`}/>}
          {rating % 1 > 0 && rating % 1 < 0.5 && <StyledIconStar key={'star-half'}/> }
          {[...Array(5 - Math.ceil(rating))].map((e, i) => <StyledIconStar key={`star-filled-${i}`}/>)}
          &nbsp;({value})
      </RatingWrapper>
    );
}

interface RatingProps {
    value: number;
    style?: React.CSSProperties;
}

export default Rating