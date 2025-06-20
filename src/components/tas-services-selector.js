'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const TasServicesSelector = props => {
  const handleChange = (e) => {
    e.preventDefault();
    props.handleSelectService('');
    const selectedService = services.find(service => service.display === e.target.value);
    props.handleSelectService(selectedService.search);
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
    {display:'Urinary tract infection', search: 'Urinary tract infection (UTI) diagnosis & treatment'},
    {display:'Oral contraceptive', search: 'Hormonal contraception'}
  ];

  

  // Get display value for select
  const getDisplayValue = () => {
    if (props.selectedServices.length > 1) {
      return 'Services';
    }
    const selectedService = services.find(service => service.search === props.selectedServices[0]);
    return selectedService ? selectedService.display : '';
  }

  return (
    <select 
      className="pharmacy-map__filter-results fap-input form-control"
      value={getDisplayValue()}
      onChange={handleChange}
      aria-label="Filter by service"
    >
      <option value="">Services</option>
      {services.map((service, key) => (
        <option key={key} value={service.display}>
          {service.display}
        </option>
      ))}
    </select>
  );
};

TasServicesSelector.propTypes = {
  active: PropTypes.bool,
  handleSelectService: PropTypes.func,
  selectedServices: PropTypes.array,
};

export default TasServicesSelector;