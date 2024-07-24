'use strict';

import React from 'react';

const intersect = ( arr1, arr2 ) => {
  return arr1.filter( function( item ) { 
     return arr2.indexOf( item ) > -1;
  });
}

export default intersect;