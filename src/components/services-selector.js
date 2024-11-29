'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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

  return (
      <select 
        className="pharmacy-map__filter-results fap-input form-control"
        value={props.selectedServices[0] || ''}
        onChange={handleChange}
        aria-label="Filter by service"
      >
        <option value="">Services</option>
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