'use strict';

import React from 'react';
import globalSettings from '../settings/global';

const getLocationsURLForRadius = ( center, dist, serviceKeyword = null ) => {
  
  if(serviceKeyword == '!null') {
    return `${globalSettings.locationsURL}&origin=${center.lat},${center.lng}&maxdist=${( dist / 1000 )}&serviceKeyword=!null`;
  } else if(serviceKeyword != null) {
    return `${globalSettings.locationsURL}&origin=${center.lat},${center.lng}&maxdist=${( dist / 1000 )}&serviceKeyword=services:${serviceKeyword}`;
  } else {
    return `${globalSettings.locationsURL}&origin=${center.lat},${center.lng}&maxdist=${( dist / 1000 )}&serviceKeyword=!null`;
  }
};

export default getLocationsURLForRadius;
