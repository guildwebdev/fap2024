'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const QldServicesSelector = props => {
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
    {display:'Minor wound management', search: 'Wound care'},
    {display:'Nausea and vomiting', search: ''},
    {display:'Mild pain and inflammation', search: ''},
    {display:'Reflux and heartburn', search: ''},
    {display:'Hay fever', search: ''},
    {display:'Ear infections', search: ''},
    {display:'Cardiovascular disease risk reduction ', search: ''},
    {display:'Asthma', search: 'Asthma management'},
    {display:'Chronic obstructive pulmonary disease', search: 'Asthma management'},
    {display:'Quit smoking support', search: 'Quit smoking support'},
    {display:'Oral health screening and fluoride application', search: ''},
    {display:'Travel health', search: 'Travel health'},
    {display:'Weight and obesity management', search: 'Weight management'}
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

QldServicesSelector.propTypes = {
  active: PropTypes.bool,
  handleSelectService: PropTypes.func,
  selectedServices: PropTypes.array,
};

export default QldServicesSelector;