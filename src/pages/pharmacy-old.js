"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import axios from "axios";

import MapContainer from "../components/map-container";
import MapSearch from "../components/map-search";
import MapExpandButton from "../components/map-expand-button";
import globalSettings from "../settings/global";
import centerMapToAddress from "../helpers/center-map-to-address";
import onSelectLocation from "../helpers/on-select-location";
import postcodes from "../settings/data";


class Pharmacy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      centerIn: false,
      locations: [],
      mapCenter: null,
      googleBounds:{},
      selectedLocation: {}
    };

    this.onCenterChange = this.onCenterChange.bind(this);
    this.onDataReceived = this.onDataReceived.bind(this);
    this.onLocationInput = this.onLocationInput.bind(this);
    this.onSelectLocation = onSelectLocation.bind(this);
    if(props.defaultMapCenter){
      this.defaultMapCenter = JSON.parse(props.defaultMapCenter);
      console.log(this.defaultMapCenter)
    }



    if (!this.props.pharmacyId) {
      this.pharmacyId = "";
    } else {
      this.pharmacyId = this.props.pharmacyId.replace(/\s/g, "%20");
    }


  }

  /* Event handlers */

  onCenterChange(center) {
    this.setState({
      mapCenter: center
    });
  }

  getFilteredResults(data) {
    if (!this.props.pharmacyId) {
      return data;
    }

    const results = data.filter(location => {
      if (!location.id) return false;
      const match = location.id.indexOf(this.props.pharmacyId) > -1;
      return match;
    });

    return results;
  }

  onDataReceived(data) {
    const loc = this.state.selectedLocation;

    this.setState({
      filteredLocations: this.getFilteredResults(data),
      locations: this.getFilteredResults(data),
      selectedLocation: loc
    });
  }

  onLocationInput(address) {
    const regPostcode = /^[0-9]{4}$/;

    if (address.length == 4 && regPostcode.test(address) && address in postcodes) {
      address = '&address='+postcodes[address]+' '+address;
    }else{
      address = '&address='+address;
    }
    const url =
      globalSettings.geocodeURL +
      address +
      "&key=" +
      globalSettings.googleMapsAPIKey;

    axios
      .get(url)
      .then(response => {
        centerMapToAddress.call(this, response.data);
      })
      .catch(response => {
        console.error(response);
      });
  }

  onDetailsClick(location) {
    window.location.href = `${globalSettings.searchPageURL}?locationid=${
      location.id
    }&center=${location.geometry.coordinates[0]},${
      location.geometry.coordinates[1]
    }`;
  }

  /* Component methods */

/*<MapExpandButton service={this.serviceKeyword}/>*/

  render() {
    return (
      <div>
        <h1>My Pharmacy</h1>
      </div>
    );
  }
}

export default Pharmacy;
