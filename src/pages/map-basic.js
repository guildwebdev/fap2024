'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';

import MapContainer from '../components/map-container';
import MapExpandButton from '../components/map-expand-button';
import globalSettings from '../settings/global';
import onSelectLocation from '../helpers/on-select-location';

class MapBasic extends Component {
  constructor( props ) {
    super( props );

    this.state = {
      centerIn: false,
      locations: [],
      mapCenter: null,
      selectedLocation: {},
    };

    this.onCenterChange = this.onCenterChange.bind( this );
    this.onDataReceived = this.onDataReceived.bind( this );
    this.onDetailsClick = this.onDetailsClick.bind( this );
    this.onSelectLocation = onSelectLocation.bind( this );
  }

  /* Event handlers */

  onCenterChange( center ) {
    this.setState({
      mapCenter: center
    });
  }

  onDataReceived( data ) {
    const loc = this.state.selectedLocation;

    this.setState({
      filteredLocations: data,
      locations: data,
      selectedLocation: loc,
    });
  }

  onDetailsClick( location ) {
    window.location.href = `${globalSettings.searchPageURL}?locationid=${location.id}&center=${location.geometry.coordinates[0]},${location.geometry.coordinates[1]}`;
  }

  render() {
    return (
      <div>
        <MapContainer
          centerIn={this.state.centerIn}
          handleCenterChange={this.onCenterChange}
          handleSelectLocation={this.onSelectLocation}
          handleDataReceived={this.onDataReceived}
          handleDetailsClick={this.onDetailsClick}
          locations={this.state.locations}
          mapCenter={this.state.mapCenter}
          selectedLocation={this.state.selectedLocation}
          autoCenterToUserLocation={true}
          zoom={4}
          serviceKeyword={null}
          />

        <MapExpandButton />
      </div>
    );
  }
}

export default MapBasic;
