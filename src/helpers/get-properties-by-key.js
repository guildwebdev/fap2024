'use strict';

import React from 'react';

const getPropertiesByKey = ( key, data ) => {
  if( !data.length ) { return; }
  
  let arr = [];
  data.forEach( result => { 
    if( result[key] ) {
      arr.push( ...result[key].split('|'));
    }
  });
  return Array.from( new Set( arr ));
}

export default getPropertiesByKey;
