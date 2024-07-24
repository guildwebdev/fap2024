'use strict';

import React from 'react';

const queryStringToJSON = () => {            
  const pairs = window.location.search.slice(1).split('&');
  let result = {};
  
  pairs.forEach( pair => {
      pair = pair.split( '=' );
      result[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  return JSON.parse( JSON.stringify( result ));
};

export default queryStringToJSON;
