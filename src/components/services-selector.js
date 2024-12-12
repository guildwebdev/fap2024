'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// In services-selector.js

const ServicesSelector = props => {
  const handleChange = (e) => {
    e.preventDefault();
    props.handleSelectService('');
    props.handleSelectService(e.target.value);
  }

  const classes = classNames({
    'c-dropdown': true,
    'c-dropdown--services': true,
    'c-filters__dropdown': true,
    'is-active': props.active,
    'is-filters-selected': props.selectedServices.length > 0,
  });

  let servicesSorted = (props.services || []).sort();

  // Get display value for select
  const getDisplayValue = () => {
    if (props.selectedServices.length > 1) {
      return 'Multiple Services';
    }
    return props.selectedServices[0] || '';
  }

  return (
    <select 
      className="pharmacy-map__filter-results fap-input form-control"
      value={getDisplayValue()}
      onChange={handleChange}
      aria-label="Filter by service"
    >
      <option value="">Services</option>
      {props.selectedServices.length > 1 && (
        <option value="Multiple Services">Multiple Services</option>
      )}
      {servicesSorted.map((service, key) => (
        <option key={key} value={service}>
          {service}
        </option>
      ))}
    </select>
  );
}

export default ServicesSelector;

ServicesSelector.propTypes = {
  handleSelectService: PropTypes.func,
  selectedServices: PropTypes.array,
  services: PropTypes.array,
  handleClear: PropTypes.func,
}