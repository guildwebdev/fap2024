'use strict';

import React from 'react';

const queryStringToJSON = () => {
  const pairs = window.location.search.slice(1).split('&');
  let result = {};
  
  pairs.forEach(pair => {
    pair = pair.split('=');
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');
    
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });

  return result;
};

export default queryStringToJSON;
