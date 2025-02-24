'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const VicServicesSelector = props => {
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

  // Hardcoded services list
  const services = [
    'Urinary tract infection',
    'Oral contraceptive',
    'Travel health vaccines',
    'Shingles',
    'Mild plaque psoriasis'
  ];

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
      {services.map((service, key) => (
        <option key={key} value={service}>
          {service}
        </option>
      ))}
    </select>
  );
};

VicServicesSelector.propTypes = {
  active: PropTypes.bool,
  handleSelectService: PropTypes.func,
  selectedServices: PropTypes.array,
};

export default VicServicesSelector;