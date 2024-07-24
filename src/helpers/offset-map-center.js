'use strict';

import React from 'react';
import scriptLoader from 'react-async-script-loader';
import globalSettings from "../settings/global";

const offsetMapCenter = ( map, center, offsetx, offsety ) => {
  var currentCenter = new window.google.maps.LatLng( center.lat, center.lng )
  var point1 = map.getProjection().fromLatLngToPoint( currentCenter );

  var point2 = new window.google.maps.Point(
    (( typeof( offsetx ) == 'number' ? offsetx : 0 ) / Math.pow( 2, map.getZoom()) ) || 0,
    (( typeof( offsety ) == 'number' ? offsety : 0 ) / Math.pow( 2, map.getZoom()) ) || 0
  );

  var newCenter = map.getProjection().fromPointToLatLng( new window.google.maps.Point(
    point1.x - point2.x,
    point1.y + point2.y
  ));

  return({ lat: newCenter.lat(), lng: newCenter.lng() });
};

export default offsetMapCenter;