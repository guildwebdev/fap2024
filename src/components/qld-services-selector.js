'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const QldServicesSelector = props => {
  const [selectedId, setSelectedId] = React.useState('');

  const handleChange = (e) => {
    e.preventDefault();
    const selectedId = parseInt(e.target.value);
    setSelectedId(selectedId);
    
    props.handleSelectService('');
    const selectedService = services.find(service => service.id === selectedId);
    if (selectedService) {
      props.handleSelectService(selectedService.search);
    }
  }

  React.useEffect(() => {
    
    // If selectedServices is empty, reset the selectedId
    if (props.selectedServices.length === 0) {
      setSelectedId('');
    }

    const handleServiceSelection = (event) => {
      const { serviceId } = event.detail;
      
      // Update the selected ID
      setSelectedId(serviceId);
      
      // Find and update the corresponding service
      const selectedService = services.find(service => service.id === serviceId);
      if (selectedService) {
        props.handleSelectService(selectedService.search);
      }
    };

    // Add event listener
    window.addEventListener('selectService', handleServiceSelection);

    // Cleanup
    return () => {
      window.removeEventListener('selectService', handleServiceSelection);
    };

  }, [props.selectedServices]);

  const classes = classNames({
    'c-dropdown': true,
    'c-dropdown--services': true,
    'c-filters__dropdown': true,
    'is-active': props.active,
    'is-filters-selected': props.selectedServices.length > 0,
  });

  // Hardcoded services list
  const services = [
    {id: 0, display:'Services', search: ''},
    {id: 1, display:'Minor wound management', search: 'Wound care'},
    {id: 2, display:'Nausea and vomiting', search: 'Full Scope of Practice Pilot'},
    {id: 3, display:'Mild pain and inflammation', search: 'Full Scope of Practice Pilot'},
    {id: 4, display:'Reflux and heartburn', search: 'Full Scope of Practice Pilot'},
    {id: 5, display:'Hay fever', search: 'Full Scope of Practice Pilot'},
    {id: 6, display:'Ear infections', search: 'Full Scope of Practice Pilot'},
    {id: 7, display:'Cardiovascular disease risk reduction', search: 'Full Scope of Practice Pilot'},
    {id: 19, display: 'Hormonal contraception', search: 'Hormonal contraception'},
    {id: 8, display:'Asthma', search: 'Asthma management'},
    {id: 9, display:'Chronic obstructive pulmonary disease', search: 'Asthma management'},
    {id: 10, display:'Quit smoking support', search: 'Quit smoking support'},
    //{id: 11, display:'Oral health screening and fluoride application', search: 'Full Scope of Practice Pilot'},
    {id: 12, display:'Travel health', search: 'Travel health'},
    {id: 13, display:'Weight and obesity management', search: 'Weight management'},
    {id: 14, display:'Shingles', search:'Shingles diagnosis & treatment'},
    {id: 15, display:'School sores', search:'Skin conditions treatment'},
    {id: 16, display:'Eczema', search:'Skin conditions treatment'},
    {id: 17, display:'Psoriasis', search:'Psoriasis (mild flare ups) diagnosis & treatment'},
    {id: 18, display:'Mild to moderate acne', search:'Skin conditions treatment'}
];

  

  // Get display value for select
  const getDisplayValue = () => {
    if (props.selectedServices.length > 1) {
      return '';
    }
    const selectedService = services.find(service => service.search === props.selectedServices[0]);
    return selectedService ? selectedService.id : '';
  }

  return (
    <select 
        className="pharmacy-map__filter-results fap-input form-control"
        value={selectedId || ''}
        onChange={handleChange}
        aria-label="Filter by service"
    >
        {services.map((service) => (
            <option key={service.id} value={service.id}>
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