"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { render } from "react-dom";

import axios from "axios";
import classNames from "classnames";
import GoogleMapReact from "google-map-react";
import _ from "lodash";
import moment from "moment";

import ToggleViewButtons from "../components/toggle-view-buttons";
import SearchFilters from "../components/search-filters";
import SearchResults from "../components/search-results";
import SearchDetails from "../components/search-details";
import MapSearch from "../components/map-search";
import MapContainer from "../components/map-container";

import getPropertiesByKey from "../helpers/get-properties-by-key";
import queryStringToJSON from "../helpers/query-string-to-json";
import centerMapToAddress from "../helpers/center-map-to-address";
import offsetMapCenter from "../helpers/offset-map-center";
import intersect from "../helpers/intersect";
import globalSettings from "../settings/global";
import postcodes from "../settings/data";
import Cookies from 'js-cookie';

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredLocations: [],
      locations: [],
      services: [],
      serviceFilters: [],
      timeFilters: [],

      highlightedLocation: {},
      mapCenter: {},
      selectedLocation: {},
      googleBounds:{},
      centerIn: false,
      detailsViewActive: false,
      filtersApplied: false,
      filtersExpanded: false,
      scrollToItem: false,
      zoomIn: false,

      defaultLocation: null,
      defaultLocationId: null,
      defaultLocationCoordinates: null,
      selectedView: "map"
    };

    this.queryString = {};

    this.filterTimeNow = this.filterTimeNow.bind(this);
    this.filterTimeExtendedHours = this.filterTimeExtendedHours.bind(this);
    this.filterTimeWeekends = this.filterTimeWeekends.bind(this);
    this.getFilteredResults = this.getFilteredResults.bind(this);
    this.onApplyFilters = this.onApplyFilters.bind(this);
    this.onBackBtnClick = this.onBackBtnClick.bind(this);
    this.onCenterChange = this.onCenterChange.bind(this);
    this.onClearFilters = this.onClearFilters.bind(this);
    this.onDataReceived = this.onDataReceived.bind(this);
    this.onFilterToggle = this.onFilterToggle.bind(this);
    this.onHideDetails = this.onHideDetails.bind(this);
    this.onHighlightLocation = this.onHighlightLocation.bind(this);
    this.onLocationInput = this.onLocationInput.bind(this);
    this.onShowDetailsFromMap = this.onShowDetailsFromMap.bind(this);
    this.onShowDetailsFromResults = this.onShowDetailsFromResults.bind(this);
    this.onSelectLocation = this.onSelectLocation.bind(this);
    this.onSelectService = this.onSelectService.bind(this);
    this.onSelectTime = this.onSelectTime.bind(this);
    this.onViewToggle = this.onViewToggle.bind(this);
  }

  /* Component lifecycle events */

  componentWillMount() {
    this.queryString = queryStringToJSON();

    if (this.queryString.loc) {
      this.setState({ defaultLocation: this.queryString.loc });
    }

    if (this.queryString.locationid) {
      this.setState({
        defaultLocationId: this.queryString.locationid,
        defaultLocationCoordinates: {
          lat: Number(this.queryString.center.split(",")[1]),
          lng: Number(this.queryString.center.split(",")[0])
        }
      });
    }
  }

  //CREATES UNIQUE ID
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  componentDidMount() {
    var userCookie = Cookies.get('fapDetails');

    if (userCookie) {
      userCookie = JSON.parse(userCookie);
      userCookie.sessionId = this.uuidv4();      
      Cookies.set('fapDetails', JSON.stringify(userCookie));
    }


    if (this.queryString.service) {
      this.onSelectService(this.queryString.service);
      this.onApplyFilters();
    }

    if (this.state.defaultLocation) {
      this.onLocationInput(this.state.defaultLocation);
    }
  }

  /* Event handlers */

  onApplyFilters() {
    this.setState({
      filteredLocations: this.getFilteredResults(),
      filtersApplied: true
    });
  }

  onBackBtnClick() {
    this.setState({ detailsViewActive: false });
  }

  onCenterChange(center) {
    this.setState({
      mapCenter: center
    });
  }

  onClearFilters() {
    this.setState({
      serviceFilters: [],
      timeFilters: [],
      filteredLocations: this.state.locations,
      filtersApplied: false
    });
  }

  onDataReceived(data) {
    const locs = this.getLocationsWithinBounds(data);

    console.log('Locations incoming:');
    console.log(locs);

    // for some reason in dev we get duplicates
    const locations = [];
    locs.forEach(loc => {
      if(locations.some(e => e.id == loc.id)== false) {
        locations.push(loc);
      }
    });

    let state = {
      locations: locations,
      filteredLocations: this.getFilteredResults(locations),
      selectedLocation: this.state.selectedLocation,
      services: getPropertiesByKey("services", data)
    };

    if (this.state.defaultLocationId) {
      const loc = data.filter(
        item => item.id == this.state.defaultLocationId
      )[0];

      state = Object.assign({}, state, {
        selectedLocation: loc,
        mapCenter: {
          lat: Number(loc.geometry.coordinates[1]),
          lng: Number(loc.geometry.coordinates[0])
        },
        zoomIn: true,
        scrollToItem: true,
        defaultLocationId: null
      });
    }

    this.setState(state);
  }

  onFilterToggle(e) {
    this.setState({ filtersExpanded: !this.state.filtersExpanded });
  }

  onHideDetails() {
    this.setState({ detailsViewActive: false });
  }

  onHighlightLocation(location) {
    this.setState({ highlightedLocation: location });
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
        console.log(response);
      });
  }

  onSelectLocation(location, showDetails = false, centerIn = false, map) {
    if (!location.name) {
      this.setState({
        selectedLocation: {},
        detailsViewActive: showDetails,
        centerIn: false
      });
    } else {
      let newState = {
        selectedLocation: Object.assign({}, location),
        detailsViewActive: showDetails,
        zoomIn: false,
        centerIn: centerIn,
        scrollToItem: true
      };

      if (centerIn) {
        let center = {
          lat: Number(location.geometry.coordinates[1]),
          lng: Number(location.geometry.coordinates[0])
        };

        if (map && window.innerWidth < 600) {
          center = offsetMapCenter(map, center, 0, 85);
        }

        newState.mapCenter = !centerIn ? null : center;
      }

      this.setState(newState);
    }
  }

  onSelectService(service) {
    if (this.state.serviceFilters.indexOf(service) === -1) {
      this.setState({
        serviceFilters: [...this.state.serviceFilters, service]
      });
    } else {
      this.setState({
        serviceFilters: this.state.serviceFilters.filter(
          item => item !== service
        )
      });
    }
  }

  //TIME FILTERS
  onSelectTime(time) {
    console.log(time);
    if (this.state.timeFilters.indexOf(time) === -1) {
      this.setState({ timeFilters: [...this.state.timeFilters, time] });
    } else {
      this.setState({
        timeFilters: this.state.timeFilters.filter(item => item !== time)
      });
    }
  }

  onShowDetailsFromMap(location) {
    this.setState({
      selectedLocation: location,
      detailsViewActive: true,
      zoomIn: false,
      centerIn: false,
      scrollToItem: true
    });
  }

  onShowDetailsFromResults(location) {
    const center = {
      lat: Number(location.geometry.coordinates[1]),
      lng: Number(location.geometry.coordinates[0])
    };

    this.setState({
      selectedLocation: location,
      detailsViewActive: true,
      zoomIn: true,
      centerIn: true,
      mapCenter: center,
      scrollToItem: false
    });
  }

  onViewToggle() {
    this.setState({
      selectedView: this.state.selectedView === "map" ? "list" : "map"
    });
  }

  /* Filter methods */

  getFilteredResults(data = this.state.locations) {
    if (!this.state.serviceFilters.length && !this.state.timeFilters.length) {
      return data;
    }

    const services = this.getResultsFilteredByService(data);
    const time = this.getResultsFilteredByTime(data);
    const arrs = [services, time].sort((a, b) => b.length - a.length);

    const results =
      services.length && time.length
        ? intersect(services, time)
        : intersect([arrs[0], arrs[1]], data);

    return Array.from(new Set(results));
  }

  getResultsFilteredByService(data) {
    if (!this.state.serviceFilters.length) {
      return data;
    }

    const results = data.filter(location => {
      const match = this.state.serviceFilters.every(item => {
        if (!location.services) return false;
        return location.services.indexOf(item) > -1;
      });

      return match;
    });

    return results;
  }

  getResultsFilteredByTime(data) {
    if (!this.state.timeFilters.length) {
      return data;
    }

    const now = this.filterTimeNow(data);
    const extendedHours = this.filterTimeExtendedHours(data);
    const weekends = this.filterTimeWeekends(data);
    let results = [];

    const arrs = [now, extendedHours, weekends].filter(arr => arr.length > 0);

    if (arrs.length === 3) {
      results = intersect(intersect(arrs[0], arrs[1]), arrs[2]);
    } else if (arrs.length === 2) {
      results = intersect(arrs[0], arrs[1]);
    } else {
      results = arrs[0];
    }

    return Array.from(new Set(results));
  }

   filterTimeNow(data) {
    let results = [];

    const xmas = "Fri Jan 26 2024";
    //const todayDate = moment(xmas).format('YYYY/MM/DD');
    const todayDate = moment().format('YYYY/MM/DD');
    var openTime, closingTime;
    const today = moment().format("dddd").toLowerCase();
    var t;

    if (this.state.timeFilters.includes("Now")) {
      results = data.filter(location => {

        //Checks for Exception Hours
        //If present - loop through looking for today's date
        //If today's date is found, use exception hours for comparison
        if (location.openingHourExceptions){
          var d = location.openingHourExceptions;
          for (var i = 0; i < d.length; i++){
            if (d[i].date == todayDate){
              if (d[i].open == "Closed"){
                return false;
              } else {
                openTime = moment().set({
                  hour: d[i].open.split(":")[0],
                  minute: d[i].open.split(":")[1]
                });

                closingTime = moment().set({
                  hour: d[i].close.split(":")[0],
                  minute: d[i].close.split(":")[1]
                });
              }
            } else {
              //If today's date is not found, compare against standard hours
              t = location[today];
              if (!t.open) return false;

              openTime = moment().set({
                hour: t.open.split(":")[0],
                minute: t.open.split(":")[1]
              });

              closingTime = moment().set({
                hour: t.close.split(":")[0],
                minute: t.close.split(":")[1]
              });
            }
          }
        } else { 
          //No exception hours
          //Compare against standard hours        
          t = location[today];
          if (!t.open) return false;

          openTime = moment().set({
            hour: t.open.split(":")[0],
            minute: t.open.split(":")[1]
          });

          closingTime = moment().set({
            hour: t.close.split(":")[0],
            minute: t.close.split(":")[1]
          });
        }
        return moment().isAfter(openTime) && moment().isBefore(closingTime);
      });
    }

    return results;
  }

  filterTimeExtendedHours(data) {
    let results = [];

    if (this.state.timeFilters.indexOf("Extended hours") !== -1) {
      results = data.filter(item => item.extendedHours === "true");
    }

    return results;
  }

  filterTimeWeekends(data) {
    let results = [];

    if (this.state.timeFilters.indexOf("Weekends") !== -1) {
      results = data.filter(item => item.weekends === "true");
    }

    return results;
  }

  /* Component methods */

  getLocationsWithinBounds(locations) {
    if (!locations) {
      return;
    }

    const bounds = this.refs.mapContainer.refs.map.prevBounds_;

    return locations.filter(location => {
      const eastBound = location.geometry.coordinates[0] < bounds[7];
      const westBound = location.geometry.coordinates[0] > bounds[5];
      let inLong;

      if (bounds[7] < bounds[5]) {
        inLong = eastBound || westBound;
      } else {
        inLong = eastBound && westBound;
      }

      const inLat =
        location.geometry.coordinates[1] > bounds[4] &&
        location.geometry.coordinates[1] < bounds[6];
      return inLat && inLong;
    });
  }

  render() {
    const filterSectionClasses = classNames({
      "s-filtered-search__section": true,
      "s-filtered-search__section--filters": true,
      "is-filters-expanded": this.state.filtersExpanded,
      "is-details-view": this.state.detailsViewActive,
      "is-list-view": this.state.selectedView === "list"
    });

    return (
      <div>
        <div className={filterSectionClasses}>
          <div className="s-filtered-search__wrapper">
            <div className="s-filtered-search__subsection">
              <ToggleViewButtons
                filtersApplied={this.state.filtersApplied}
                handleFilterToggle={this.onFilterToggle}
                handleViewToggle={this.onViewToggle}
                selectedView={this.state.selectedView}
              />
              <SearchFilters
                active={this.state.filtersExpanded}
                filtersApplied={this.state.filtersApplied}
                handleFilterToggle={this.onFilterToggle}
                handleSelectService={this.onSelectService}
                handleSelectTime={this.onSelectTime}
                handleApply={this.onApplyFilters}
                handleClear={this.onClearFilters}
                selectedServices={this.state.serviceFilters}
                selectedTimes={this.state.timeFilters}
                services={this.state.services}
              />
              <SearchResults
                handleClick={this.onShowDetailsFromResults}
                handleMouseOver={this.onHighlightLocation}
                highlightedLocation={this.state.highlightedLocation}
                results={this.state.filteredLocations}
                scrollToSelectedItem={this.state.scrollToItem}
                selectedLocation={this.state.selectedLocation}
              />
            </div>

            <div className="s-filtered-search__subsection s-filtered-search__details">
              <SearchDetails
                backHandler={this.onBackBtnClick}
                location={this.state.selectedLocation}
              />
            </div>
          </div>
        </div>

        <div className="s-filtered-search__section s-filtered-search__section--map">
          <MapSearch
            defaultLocation={this.state.defaultLocation}
            handleInput={this.onLocationInput}
          />

          <div className="c-map-container c-map-container--search">
            <MapContainer
              centerIn={this.state.centerIn}
              defaultLocation={this.state.defaultLocation}
              defaultLocationId={this.state.defaultLocationId}
              defaultLocationCoordinates={this.state.defaultLocationCoordinates}
              handleCenterChange={this.onCenterChange}
              handleHighlightLocation={this.onHighlightLocation}
              handleDetailsClick={this.onShowDetailsFromMap}
              handleDetailsHide={this.onHideDetails}
              handleDataReceived={this.onDataReceived}
              handleSelectLocation={this.onSelectLocation}
              highlightedLocation={this.state.highlightedLocation}
              locations={this.state.filteredLocations}
              mapCenter={this.state.mapCenter}
              googleBounds = {this.state.googleBounds}
              ref="mapContainer"
              selectedLocation={this.state.selectedLocation}
              autoCenterToUserLocation={false}
              zoom={5}
              zoomIn={this.state.zoomIn}
              serviceKeyword={null}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
