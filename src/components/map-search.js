'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class MapSearch extends Component {
  constructor( props ) {
    super( props );

    this.state = {
      input: this.props.defaultLocation || '',
      stateInput: '',
    };

    this.onChange = this.onChange.bind( this );
    this.updateInput = this.updateInput.bind( this );
    this.onStateChange = this.onStateChange.bind( this );
    this.updateStateInput = this.updateStateInput.bind( this );
  }

  /* Event handlers */

  onStateChange( e ) {
    const str = e.target.value;
    this.setState( { stateInput: str});

    const t = setTimeout( () => {
      this.updateStateInput( str );
    }, 500 );
  }

  onChange( e ) {
    const str = e.target.value;
    this.setState({ input: str });

    const t = setTimeout( () => {
      this.updateInput( str );
    }, 500 );
  }

  /* Component methods */

  updateInput( input ) {
    if (this.state.stateInput && this.state.stateInput.length > 0) {
      var stateDD = this.state.stateInput;
    } else {
      var stateDD = '';
    }

    if( input === this.state.input && input.length > 3 ) {
      input = input +' '+stateDD;
      this.props.handleInput( input );
    }
  }

  updateStateInput( input ) {
    if (this.state.input && this.state.input.length > 3) {
      var inputLoc = this.state.input;
    } else {
      var inputLoc = ''
    }

    if ( input === this.state.stateInput && input.length > 0) {
      input = inputLoc +' '+input;
      this.props.handleInput( input );
    }
  }

  render() {
    return (
      <div className="c-map__search">
        <input 
          className="c-dropdown__input c-dropdown__embed c-location" 
          onChange={this.onChange}
          placeholder={this.props.title || 'Search by location'}
          type="text" 
          value={this.state.input}
           />
          <select
            className="c-dropdown__input c-dropdown__embed c-state"
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
    );
  }
}

export default MapSearch;

MapSearch.propTypes = {
  defaultLocation: PropTypes.string,
  handleInput: PropTypes.func,
  title: PropTypes.string,
}
