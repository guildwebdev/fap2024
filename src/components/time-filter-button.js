'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const TimeFilterButton = props => {
  const classes = classNames({
    'c-btn': true,
    'c-btn--border-inverse': true,
    'c-btn--ter': true,
    'c-filters__btn': true,
    'is-active': props.selectedTimes.indexOf( props.value ) > -1,
  });

  return (
    <button 
      className={classes}
      value={props.value}
      onClick={props.handleClick}>
      { props.value }
    </button>
  );
}

export default TimeFilterButton;

TimeFilterButton.propTypes = {
  active: PropTypes.bool,
  handleClick: PropTypes.func,
  selectedTimes: PropTypes.array,
  value: PropTypes.string,
}  
