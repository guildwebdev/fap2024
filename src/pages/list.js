// src/pages/list-view.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import axios from "axios";

import MapSearch from "../components/map-search";
import SearchFilters from "../components/search-filters";
import NearbyPharmacies from "../components/nearby-pharmacies";
import centerMapToAddress from "../helpers/center-map-to-address";
import onSelectLocation from "../helpers/on-select-location";

class ListView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locations: [],
      selectedLocation: {},
      userLocation: {
        latitude: null,
        longitude: null,
      },
      selectedServices: [],
      selectedTimes: []
    };

    this.onDataReceived = this.onDataReceived.bind(this);
    this.onLocationInput = this.onLocationInput.bind(this);
    this.onSelectLocation = onSelectLocation.bind(this);
  }

  componentDidMount() {
    this.getUserLocation();
  }

  getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.setState({
            userLocation: {
              latitude,
              longitude,
            },
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  onDataReceived(data) {
    this.setState({
      locations: data
    });
  }

  onLocationInput(address) {
    centerMapToAddress(address, (center) => {
      this.setState({
        userLocation: {
          latitude: center.lat,
          longitude: center.lng
        }
      });
    });
  }

  handleFilterChange = (services, times) => {
    this.setState({
      selectedServices: services,
      selectedTimes: times
    });
  };

  render() {
    return (
      <div className="list-view">
        <div className="list-view__search">
          <MapSearch 
            onLocationInput={this.onLocationInput}
          />
          <SearchFilters
            selectedServices={this.state.selectedServices}
            selectedTimes={this.state.selectedTimes}
            handleFilterChange={this.handleFilterChange}
          />
        </div>
        
        <div className="list-view__results">
          <NearbyPharmacies
            locations={this.state.locations}
            origin={this.state.userLocation}
          />
        </div>
      </div>
    );
  }
}

export default ListView;

ListView.propTypes = {
  serviceKeyword: PropTypes.string,
  defaultMapCenter: PropTypes.string
};