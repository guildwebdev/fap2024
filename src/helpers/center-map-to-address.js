'use strict';

import React from 'react';

const centerMapToAddress = function( address ) {
  if( !address.results.length ) return;

  const state = {
    mapCenter:address.results[0].geometry.location,
    googleBounds:address.results[0].geometry.bounds
  }

  this.setState(state);
};

export default centerMapToAddress;

