"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import axios from "axios";

import MapContainer from "../components/map-container";
import MapSearch from "../components/map-search";
import MapExpandButton from "../components/map-expand-button";
import MapFilters from "../components/map-filters"; // Add this import
import globalSettings from "../settings/global";
import centerMapToAddress from "../helpers/center-map-to-address";
import onSelectLocation from "../helpers/on-select-location";
import postcodes from "../settings/data";

class MapWithSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      centerIn: false,
      locations: [],
      filteredLocations: [],
      mapCenter: null,
      googleBounds: {},
      selectedLocation: {},
      userLocation: {
        latitude: null,
        longitude: null,
      },
      selectedServices: [],
      availableServices: []
    };

    this.onCenterChange = this.onCenterChange.bind(this);
    this.onDataReceived = this.onDataReceived.bind(this);
    this.onLocationInput = this.onLocationInput.bind(this);
    this.onSelectLocation = onSelectLocation.bind(this);
    this.onToggleService = this.onToggleService.bind(this);
    this.applyServiceFilters = this.applyServiceFilters.bind(this);
    this.onToggleService = this.onToggleService.bind(this);

    if (props.defaultMapCenter) {
      this.defaultMapCenter = JSON.parse(props.defaultMapCenter);
      console.log(this.defaultMapCenter);
    }

    if (this.props.serviceKeyword) {
      this.availableServices = this.props.serviceKeyword
        //.split(',')
        .split('|')
        .map(service => service.trim());
    } else {
      this.availableServices = [];
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            userLocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Set a default location if geolocation fails
          this.setState({
            userLocation: {
              latitude: -25.2744,
              longitude: 133.7751
            }
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }

  // Toggle service selection
  onToggleService(service) {
    const { selectedServices } = this.state;
  
    let newSelectedServices;
    if (selectedServices.includes(service)) {
      // Remove the service
      newSelectedServices = selectedServices.filter(s => s !== service);
    } else {
      // Replace all services with just this one (radio button behavior)
      newSelectedServices = [service];
    }
  
    // Update state and re-filter immediately
    this.setState({
      selectedServices: newSelectedServices
    }, () => {
      this.applyServiceFilters();
    });
  }

  // Apply service filters to current location data
  applyServiceFilters() {
    const { locations } = this.state;
    const filteredData = this.getFilteredResults(locations);
    this.setState({
      filteredLocations: filteredData
    });
  }

  componentDidMount() {
    this.getUserLocation();
  }

  /* Event handlers */

  onCenterChange(center) {
    this.setState({
      mapCenter: center
    });
  }

  /*getFilteredResults(data) {
    const { selectedServices } = this.state;
    
    // If no services selected, show all data
    if (!selectedServices.length) {
      return data;
    }

    return data.filter(location => {
      if (!location.services) return false;
      
      // Check if location has ANY of the selected services (case-insensitive)
      return selectedServices.some(service => 
        location.services.toLowerCase().includes(service.toLowerCase())
      );
    });
  }*/
  getFilteredResults(data) {
    const { selectedServices } = this.state;
    
    // If no services selected but we have serviceKeyword prop, 
    // filter by available services
    if (!selectedServices.length && this.availableServices.length > 0) {
      return data.filter(location => {
        if (!location.services) return false;
        
        // Check if location has ANY of the available services
        return this.availableServices.some(service => 
          location.services.toLowerCase().includes(service.toLowerCase())
        );
      });
    }
    
    // If no services selected and no serviceKeyword, show all data
    if (!selectedServices.length) {
      return data;
    }
  
    // Filter by selected services
    return data.filter(location => {
      if (!location.services) return false;
      
      return selectedServices.some(service => 
        location.services.toLowerCase().includes(service.toLowerCase())
      );
    });
  }

  onDataReceived(data) {
    const loc = this.state.selectedLocation;
    
    // Apply current service filters to the new data
    const filteredData = this.getFilteredResults(data);

    this.setState({
      locations: data,
      filteredLocations: filteredData,
      selectedLocation: loc
    });
  }

  onLocationInput(address) {
    const regPostcode = /^[0-9]{4}$/;

    if (address.length == 4 && regPostcode.test(address) && address in postcodes) {
      address = '&address=' + postcodes[address] + ' ' + address;
    } else {
      address = '&address=' + address;
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

  render() {
    const { userLocation, filteredLocations, selectedServices } = this.state;

    return (
      <div className="map-with-search-container">
        <MapSearch
          defaultLocation={this.state.defaultLocation}
          handleInput={this.onLocationInput}
          title="My town/state"
        />

        {/* Remove the old renderServiceFilters() call */}
        
        <div className="map-wrapper">
          {this.availableServices.length > 1 && (
            <MapFilters
              availableServices={this.availableServices}
              selectedServices={selectedServices}
              onToggleService={this.onToggleService}
            />
          )}
          
          <MapContainer
            autoCenterToUserLocation={true}
            centerIn={this.state.centerIn}
            handleCenterChange={this.onCenterChange}
            handleSelectLocation={this.onSelectLocation}
            handleDataReceived={this.onDataReceived}
            handleDetailsClick={this.onDetailsClick}
            locations={filteredLocations}
            mapCenter={this.state.mapCenter}
            googleBounds={this.state.googleBounds}
            selectedLocation={this.state.selectedLocation}
            serviceKeyword={this.props.serviceKeyword}
            defaultMapCenter={this.defaultMapCenter}
            zoom={4}
            userLatitude={userLocation.latitude}
            userLongitude={userLocation.longitude}
          />
        </div>
      </div>
    );
  }
}

export default MapWithSearch;