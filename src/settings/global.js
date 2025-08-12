"use strict";

import React from "react";

const globalSettings = {
  locationsURL: "https://tpgoa-search.funnelback.squiz.cloud/s/search.html?collection=tpgoa~sp-locations&profile=react-data&query=!null&num_ranks=500&sort=prox",
  //locationsURL:'https://search.guild.org.au/s/search.html?collection=pharmacy-loc&form=json&num_ranks=500&sort=prox&query=!padnull',
  pharmacyURL: 'https://tpgoa-search.funnelback.squiz.cloud/s/search.html?collection=tpgoa~sp-locations&profile=react-data&query=!null&num_ranks=1&sort=prox&meta_id=66b6f5da-a5a0-e311-93f9-2c44fd7e3c9c',
  //pharmacyURL: 'https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=1&sort=prox&query=!padnull&meta_id=66b6f5da-a5a0-e311-93f9-2c44fd7e3c9c',
  searchPageURL: "//www.findapharmacy.com.au/location-search",
  expandPageURL: "//www.findapharmacy.com.au/location-search",
  // locationMainURL:"https://search.guild.org.au/s/search.html?collection=pharmacy-loc&form=json&num_ranks=4000&sort=prox&query=!padnull",
  // locationMainURL: "//www.findapharmacy.com.au/_resources/mapdata",
  locationMainURL:window.locationMainURL,
  sendUserActionURL: "https://pgawebsitedata.azurewebsites.net/api/Activity",
  geocodeURL:
    "https://maps.googleapis.com/maps/api/geocode/json?components=country:AU",
  googleMapsAPIKey: "AIzaSyC0tUZUmguQ2wuie-3md_Z44fJJio1-BOc"
};

export default globalSettings;
