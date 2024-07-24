'use strict';


import React, { Component } from "react";
import globalSettings from "../settings/global";

var expandUrl = "";

//<a className="c-map__expand" href={globalSettings.expandPageURL+'?service='+props.service}>Expand</a>

const MapExpandButton = (props) => {

    if (props.service && props.service.length > 0) {
      expandUrl = globalSettings.expandPageURL+'?service='+props.service;
    } else {
      expandUrl = globalSettings.expandPageURL;
    }

  return (
    <a className="c-map__expand" href={expandUrl}>Expand</a>
  );
}

export default MapExpandButton;
