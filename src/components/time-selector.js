'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const TimeSelector = props => {
  const handleChange = (e) => {
    props.handleSelectTime(e.target.value);
  };

  return (
    <select 
      className="pharmacy-map__filter-results fap-input form-control"
      value={props.selectedTimes[0] || ''}
      onChange={handleChange}
      aria-label="Filter by opening hours"
    >
      <option value="">Opening hours</option>
      <option value="Now">Now</option>
      <option value="Extended hours">Extended hours</option>
      <option value="Weekends">Weekends</option>
    </select>
  );
};

export default TimeSelector;

TimeSelector.propTypes = {
  handleSelectTime: PropTypes.func,
  selectedTimes: PropTypes.array,
};