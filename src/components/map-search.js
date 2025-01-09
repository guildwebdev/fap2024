'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class MapSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: this.props.defaultLocation || '',
      stateInput: '',
      isExpanded: false, // New state for toggling
    };

    this.onChange = this.onChange.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.updateStateInput = this.updateStateInput.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this); // Bind the new method
    this.handleExternalSearch = this.handleExternalSearch.bind(this);
  }

  componentDidMount() {
    // Listen for a custom event
    window.addEventListener('externalSearch', this.handleExternalSearch);
  }

  componentWillUnmount() {
    // Remove the event listener on component unmount
    window.removeEventListener('externalSearch', this.handleExternalSearch);
  }

  handleExternalSearch(event) {
    const { searchValue, serviceName } = event.detail;
    
    if (searchValue && searchValue.trim()) {
        this.setState({ input: searchValue }, () => {
          if (searchValue.length > 3) {
            this.updateInput(searchValue);
          }
        });

        if (serviceName) {
            window.dispatchEvent(new CustomEvent('filterByService', {
                detail: {service: serviceName}
            }));
        }
    }
}

  /* Event handlers */
  handleSearchClick() {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  }

  onStateChange(e) {
    const str = e.target.value;
    this.setState({ stateInput: str });

    const t = setTimeout(() => {
      this.updateStateInput(str);
    }, 500);
  }

  onChange(e) {
    const str = e.target.value;
    this.setState({ input: str });

    if (str && str.trim()){
      clearTimeout(this.debounceTimeout);

      this.debounceTimeout = setTimeout(() => {
        this.updateInput(str);

        if (!window.dataLayer){
          window.dataLayer = [];
        }
        window.dataLayer.push({
          event: 'locationSearch',
          location: str
        });
      }, 500);
    }
  }

  /* Component methods */
  updateInput(input) {
    const stateDD = this.state.stateInput || '';

    if (input === this.state.input && input.length > 3) {
      input = input + ' ' + stateDD;
      this.props.handleInput(input);
    }
  }

  updateStateInput(input) {
    const inputLoc = this.state.input.length > 3 ? this.state.input : '';

    if (input === this.state.stateInput && input.length > 0) {
      input = inputLoc + ' ' + input;
      this.props.handleInput(input);
    }
  }

  render() {
    const { isExpanded } = this.state;

    return (
      <div className={`search-container d-flex align-items-center ${isExpanded ? 'active' : ''}`}>
        <button className="btn btn-outline-primary fap-search" onClick={this.handleSearchClick}>
          <i className="fa-solid fa-search"></i>
        </button>
        {isExpanded && (
          <div className="search-input-group ms-2">
            <input
              className="c-dropdown__input c-dropdown__embed c-location form-control"
              onChange={this.onChange}
              placeholder={this.props.title || 'Search by location'}
              type="text"
              value={this.state.input}
              data-location={this.state.input}
            />
            <select
              className="c-dropdown__input c-dropdown__embed c-state form-select"
              onChange={this.onStateChange}
              value={this.state.stateInput}
            >
              <option value="">Australia</option>
              <option value="ACT">ACT</option>
              <option value="NSW">NSW</option>
              <option value="NT">NT</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="VIC">VIC</option>
              <option value="WA">WA</option>
            </select>
          </div>
        )}
      </div>
    );
  }
}

export default MapSearch;

MapSearch.propTypes = {
  defaultLocation: PropTypes.string,
  handleInput: PropTypes.func,
  title: PropTypes.string,
};
