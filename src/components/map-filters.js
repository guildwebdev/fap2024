"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";

class MapFilters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false,
    };

    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleServiceSelect = this.handleServiceSelect.bind(this);
    this.handleAllSelect = this.handleAllSelect.bind(this);
  }

  handleFilterClick() {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  }

   handleServiceSelect(selectedService) {
    const { selectedServices, onToggleService } = this.props;
    
    // If this service is already selected, do nothing (radio button behavior)
    if (selectedServices.includes(selectedService)) {
      return;
    }
    
    // Just toggle the service - the parent will handle the replacement logic
    onToggleService(selectedService);
  }

  handleAllSelect() {
    const { selectedServices, onToggleService } = this.props;
    
    // If already showing all, do nothing
    if (selectedServices.length === 0) {
      return;
    }
    
    // Clear all selections to show "All"
    [...selectedServices].forEach(service => {
      onToggleService(service);
    });
  }

  render() {
    const { isExpanded } = this.state;
    const { availableServices, selectedServices } = this.props;

    if (!availableServices.length) {
      return null;
    }

    const isAllSelected = selectedServices.length === 0;
    const selectedService = selectedServices.length === 1 ? selectedServices[0] : null;

    return (
      <div className={`map-filters-container ${isExpanded ? 'active' : ''}`}>
        <button 
          className="btn btn-outline-primary fap-filters" 
          onClick={this.handleFilterClick}
          title="Filter services"
        >
          <i className="fa-solid fa-filter"></i>
          {!isAllSelected && (
            <span className="filter-count">1</span>
          )}
        </button>
        
        {isExpanded && (
          <div className="filters-panel">
            <div className="filters-header">
              <h4>Filter by services</h4>
            </div>
            
            <div className="filters-content">
              {/* All checkbox-styled radio button */}
              <label className={`service-checkbox all-checkbox ${isAllSelected ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="service-filter"
                  checked={isAllSelected}
                  onChange={this.handleAllSelect}
                  style={{ display: 'none' }}
                />
                <span className="custom-checkbox">
                  {isAllSelected && <i className="fa-solid fa-check"></i>}
                </span>
                <span className="checkbox-label">All Services</span>
              </label>
              
              <hr className="filter-divider" />
              
              {/* Individual service checkbox-styled radio buttons */}
              {availableServices.map(service => {
                const isServiceSelected = selectedServices.includes(service);
                return (
                  <label 
                    key={service} 
                    className={`service-checkbox ${isServiceSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="service-filter"
                      checked={isServiceSelected}
                      onChange={() => this.handleServiceSelect(service)}
                      style={{ display: 'none' }}
                    />
                    <span className="custom-checkbox">
                      {isServiceSelected && <i className="fa-solid fa-check"></i>}
                    </span>
                    <span className="checkbox-label">{service}</span>
                  </label>
                );
              })}
            </div>
            
          </div>
        )}
      </div>
    );
  }
}

MapFilters.propTypes = {
  availableServices: PropTypes.array.isRequired,
  selectedServices: PropTypes.array.isRequired,
  onToggleService: PropTypes.func.isRequired,
};

export default MapFilters;