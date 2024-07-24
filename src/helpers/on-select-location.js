'use strict';

import React from 'react';
import offsetMapCenter from '../helpers/offset-map-center';

const onSelectLocation = function( location, showDetails = false, centerIn = false, map ) {

  if( !location.name ) {
    this.setState({ selectedLocation: {}, centerIn: false });
  }

  else {
    let newState = {
      centerIn: centerIn,
      selectedLocation: Object.assign( {}, location ),
    };

    if( centerIn ) {
      newState.mapCenter = {
        lat: Number( location.geometry.coordinates[1] ),
        lng: Number( location.geometry.coordinates[0] ),
      };

      if( map && window.innerWidth < 600 ) {
        newState.mapCenter = offsetMapCenter( map, newState.mapCenter, 0, 70 );
      }
    }

    this.setState( newState );
  }
};

export default onSelectLocation;
