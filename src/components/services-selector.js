'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ServiceListItem from './service-list-item';

const ServicesSelector = props => {
  /* Event handlers */

  const onDropdownToggle = e => {
    e.preventDefault();
    props.handleToggle();
  }

  /* Component methods */

  const renderServicesSelectedMessage = () => {
    const str = props.selectedServices.length > 1 ? 'services' : 'service';
    return `${props.selectedServices.length} ${str} selected`;
  }

  /* Computed properties */

  const classes = classNames({
    'c-dropdown': true,
    'c-dropdown--services': true,
    'c-filters__dropdown': true,
    'is-active': props.active,
    'is-filters-selected': props.selectedServices.length > 0,
  });

  let servicesSorted = (props.services || []).sort();

  const services = servicesSorted.map(( service, key ) => (
    <ServiceListItem
      key={key}
      active={props.selectedServices.indexOf( service ) > -1}
      service={service}
      handleClick={props.handleSelectService}
      />
  ));


  const servicesHeading = props.selectedServices.length === 0 ?
    'Select service' :
    renderServicesSelectedMessage();

  return (
    <div className={classes}>
      <a href="#" className="c-dropdown__topbar" onClick={onDropdownToggle}>
        <p className="c-dropdown--services__heading">{ servicesHeading }</p>
      </a>

      <div className="c-dropdown__results">
        <ul className="c-dropdown__results-list c-filters__list">
          { services }
        </ul>
      </div>
    </div>
  );
}

export default ServicesSelector;

ServicesSelector.propTypes = {
  handleSelectService: PropTypes.func,
  handleToggle: PropTypes.func,
  selectedServices: PropTypes.array,
  services: PropTypes.array,
}
