'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ServicesSelector from './services-selector';
import TimeFilterButton from './time-filter-button';

class SearchFilters extends Component {
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
  }

  /* Event handlers */

  onDropdownToggle() {
    this.setState({ isChildrenExpanded: !this.state.isChildrenExpanded }, this.updateOverflowState );
  }

  onFilterToggle( e ) {
    e.preventDefault();
    this.setState({ isChildrenExpanded: false });
    this.props.handleFilterToggle();
    this.removeOverflowWithDelay();
  }

  onSelectTime( e ) {
    this.props.handleSelectTime( e.target.value );
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
      <div className={classes}>
        <a href="#" className="c-dropdown__topbar c-filters__topbar u-desktop-only" onClick={this.onFilterToggle}>
          <i className="c-filters__icon"></i>
          <h4 className="c-filters__heading">{ heading }</h4>
          <button className="c-filters__close"></button>
        </a>

        <div className="c-dropdown__results">
          <ul className="c-dropdown__results-list">
            <li className="c-filters__section">
              <h4 className="c-filters__subheading">Opening hours</h4>
              <div className="c-filters__button-container">
                <TimeFilterButton
                  value="Now"
                  selectedTimes={this.props.selectedTimes}
                  handleClick={this.onSelectTime}
                  />
                <TimeFilterButton
                  value="Extended hours"
                  selectedTimes={this.props.selectedTimes}
                  handleClick={this.onSelectTime}
                  />
                <TimeFilterButton
                  value="Weekends"
                  selectedTimes={this.props.selectedTimes}
                  handleClick={this.onSelectTime}
                  />
              </div>
            </li>

            <li className="c-filters__section">
              <h4 className="c-filters__subheading">Service provided</h4>

              <ServicesSelector
                {...this.props}
                handleToggle={this.onDropdownToggle}
                active={this.state.isChildrenExpanded}
                />
            </li>

            <li className="c-filters__section">
              <div className="c-filters__cta">
                <button
                  className="c-btn c-filters__btn--cta"
                  onClick={this.props.handleClear}>Clear filters
                </button>
                <button
                  className="c-btn c-filters__btn--cta u-mobile-only"
                  onClick={this.onFilterToggle}>Close
                </button>
                <button
                  className="c-btn c-filters__btn--cta"
                  disabled={this.props.selectedServices.length === 0 && this.props.selectedTimes.length === 0}
                  onClick={this.props.handleApply}>Apply
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default SearchFilters;

SearchFilters.propTypes = {
  active: PropTypes.bool,
  filtersApplied: PropTypes.bool,
  handleApply: PropTypes.func,
  handleClear: PropTypes.func,
  handleFilterToggle: PropTypes.func,
  handleSelectService: PropTypes.func,
  handleSelectTime: PropTypes.func,
  selectedServices: PropTypes.array,
  selectedTimes: PropTypes.array,
  services: PropTypes.array,
}
