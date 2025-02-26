'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import QldServicesSelector from './qld-services-selector';
import TimeFilterButton from './time-filter-button';
import TimeSelector from './time-selector';


class QldSearchFilters extends Component {
  constructor( props ) {
    super( props );

    this.state = {
      isChildrenExpanded: false,
      hasOverflow: false,
    }

    this.onDropdownToggle = this.onDropdownToggle.bind( this );
    this.onFilterToggle = this.onFilterToggle.bind( this );
    this.onSelectTime = this.onSelectTime.bind( this );
    this.removeOverflowWithDelay = this.removeOverflowWithDelay.bind( this );
    this.updateOverflowState = this.updateOverflowState.bind( this );
    this.onSelectService = this.onSelectService.bind(this);
  }

  /* Event handlers */

  onDropdownToggle() {
    this.setState({ isChildrenExpanded: !this.state.isChildrenExpanded }, this.updateOverflowState );
  }

  onFilterToggle( e ) {
    e.preventDefault();
    this.setState({
      isChildrenExpanded: false
    }, () => {
      this.props.handleFilterToggle();
      this.removeOverflowWithDelay();
    });
  }

  onSelectTime(value) {
    this.props.handleSelectTime(value);
    this.props.handleApplyFilters(); // Auto-apply after selection
  }
  
  onSelectService(value) {
    // If "Multiple Services" is selected, don't change the filters
    if (value === 'Multiple Services') {
      return;
    }
    
    this.props.handleSelectService(value);
    this.props.handleApplyFilters();
  }

  /* Component methods */

  removeOverflowWithDelay() {
    const t = setTimeout(() => {
      this.setState({ hasOverflow: false });
    }, 500);
  }

  updateOverflowState() {
    if( this.state.isChildrenExpanded ) {
      this.setState({ hasOverflow: true });
    }

    else this.removeOverflowWithDelay();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedServices !== this.props.selectedServices) {
      console.log('componentdidupdate');
      this.updateOverflowState();
    } else {
      console.log('no-componentdidupdate');
    }
  }

  render() {
    const classes = classNames({
      'c-filters': true,
      'c-filters__borderbtm': true,
      'c-dropdown': true,
      'is-active': this.props.active,
      'is-children-expanded': this.state.isChildrenExpanded,
      'is-filters-applied': this.props.filtersApplied,
      'has-overflow': this.state.hasOverflow,
    });

    const heading = this.props.filtersApplied ? 'Filters applied' : 'Filters';

    return (
      <div className="pharmacy-map__search-result-filter">
        <div>
              <QldServicesSelector
                selectedServices={this.props.selectedServices}
                handleSelectService={this.onSelectService.bind(this)}
                handleClear={this.props.handleClear}
                active={this.state.isChildrenExpanded}
             
            />
            </div>

              <span 
                className="map-to-list-toggle"
                onClick={this.props.handleClear}>
                  <i className="fa-solid fa-filter-circle-xmark"></i>
              </span>


      </div>
    );
  }
}

export default QldSearchFilters;

QldSearchFilters.propTypes = {
  active: PropTypes.bool,
  filtersApplied: PropTypes.bool,
  handleClear: PropTypes.func,
  handleFilterToggle: PropTypes.func,
  handleSelectService: PropTypes.func,
  handleSelectTime: PropTypes.func,
  selectedServices: PropTypes.array,
  selectedTimes: PropTypes.array,
  services: PropTypes.array,
  handleApplyFilters: PropTypes.func.isRequired,
}