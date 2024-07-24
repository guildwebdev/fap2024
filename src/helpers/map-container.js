"use strict";
/*eslint no-unused-vars: 0, no-extra-parens: 0*/

import React, { Component } from "react";
import PropTypes from "prop-types";
import GoogleMapReact from "google-map-react";
import supercluster from "supercluster";
import axios from "axios";

import MapMarker from "../components/map-marker";
import ClusterMarker from "../components/cluster-marker";
import UserMarker from "../components/user-marker";

import getDistance from "../helpers/get-distance";
import getLocationsURLForRadius from "../helpers/get-locations-url";
import globalSettings from "../settings/global";
import { update } from "lodash";

class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.defaultMapProps = {
      center: { lat: -28.570000000000007, lng: 132.08000000000004 },
      zoom: props.zoom
    };

    this.state = {
      clusteredLocations: [],
      defaultLocation: props.defaultLocation,
      defaultLocationId: props.defaultLocationId,
      defaultLocationCoordinates: props.defaultLocationCoordinates,
      userLocation: {},
      locations: props.locations,
      mapProps: this.defaultMapProps,
      serviceKeyword: props.serviceKeyword,
      isLocating: false,
      initialLocationSet: false,
      willZoomOut: false,
    };

    this.createMapOptions = {
      disableDoubleClickZoom: true,
      clickableIcons: false,
      fullscreenControl: false,
      panControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      // styles: [
      //   {
      //     stylers: [
      //       { saturation: -100 },
      //       { gamma: 0.7 },
      //       { lightness: 5 },
      //       { visibility: "on" }
      //     ]
      //   }
      // ]
      styles:[
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#523735"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#c9b2a6"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#dcd2be"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#ae9e90"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#93817c"
            }
          ]
        },
        {
          "featureType": "poi.business",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#a5b076"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#447530"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#fdfcf8"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f8c967"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#e9bc62"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e98d58"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#db8555"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#806b63"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8f7d77"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#b9d3c2"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#92998d"
            }
          ]
        }
      ],
    };

    this.locateTimeout = null;

    this.defaultZoomLevel = 15;
    this.zoomInLevel = 16;
    this.zoomOutLevel = 5;

    this.centerMapTo = this.centerMapTo.bind(this);
    this.locateUser = this.locateUser.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);
    this.onMapEvent = this.onMapEvent.bind(this);
    this.onSelectLocation = this.onSelectLocation.bind(this);
    this.onUserLocated = this.onUserLocated.bind(this);
    this.onUserLocationFailed = this.onUserLocationFailed.bind(this);
    this.getData = this.getData.bind(this);
  }

  getData(center, dist, serviceKeyword) {
    console.log('getting data');
    let data = localStorage.getItem('baseData');
    let updateTime = localStorage.getItem('updateTime');
    let currentTime = (new Date()).getTime();

    let database = indexedDB.open("baseData",currentTime);
    let databaseShouldUpdate = false;

    const threedays = '259200000';
    const oneday = '86400000';
    const twelvehours = '43200000';
    const sixhours = '21600000';
    const threehours = '10800000'; 
    const onehour = '3600000';
    const tenmins = '600000';

    database.onupgradeneeded = function(){
        let db = database.result;
        if(!db.objectStoreNames.contains('locations')){
          db.createObjectStore('locations',{keyPath:'id'});
        } 
        databaseShouldUpdate = true;
    }

    database.onerror = function(){
      console.log(database.error)
    }

    database.onsuccess = function(){
      if(databaseShouldUpdate){
    
        axios
        .get(globalSettings.locationMainURL)
        .then(response => {
            data = response.data.results;
            updateTime = (new Date()).getTime();
            try{
              // localStorage.setItem('baseData',JSON.stringify(data));
              let db = database.result;
              let objstore = db.transaction('locations',"readwrite").objectStore('locations');
              let i = 0;
              function putNext(index){
                if (i<data.length) {
                  objstore.put(data[i]).onsuccess = putNext;
                  ++i;
              } else {   // complete
                  console.log('populate complete');
              }
              }
              putNext();
              localStorage.setItem('updateTime',updateTime);
            }catch (e) {
              window.HDataBase = data;
            }
            // let filteredData = data;
            // filteredData.results = data.results.sort((el1,el2)=>{
            //   let p21 = {
            //     lat:parseFloat(el1.geometry.coordinates[1]),
            //     lng:parseFloat(el1.geometry.coordinates[0])
            //   };
            //   let p22 = {
            //     lat:parseFloat(el2.geometry.coordinates[1]),
            //     lng:parseFloat(el2.geometry.coordinates[0])
            //   };
            //   let dis1 = getDistance(center,p21);
            //   let dis2 = getDistance(center,p22);
            //   return dis1 - dis2;
            // }).slice(0,1800).filter(el=> {
            //     let p2 = {
            //       lat:parseFloat(el.geometry.coordinates[1]),
            //       lng:parseFloat(el.geometry.coordinates[0])
            //     };
            //     return getDistance(center,p2) <= dist;
            //   });
            // resolve(filteredData);
        }).catch(e=>{
          console.log(e)
        });
      }
    }

    if(data === null || (updateTime!==null && (currentTime - parseInt(updateTime) >= parseInt(twelvehours)))){
    //if(data === null || (updateTime!==null && (currentTime - parseInt(updateTime) >= 259200000))){

      if(window.HDataBase && window.HDataBase.results && window.HDataBase.results.length >= 2000){
        return new Promise((resolve, reject) => {
          let filteredData = window.HDataBase;
          filteredData.results = data.results.sort((el1,el2)=>{
            let p21 = {
              lat:parseFloat(el1.geometry.coordinates[1]),
              lng:parseFloat(el1.geometry.coordinates[0])
            };
            let p22 = {
              lat:parseFloat(el2.geometry.coordinates[1]),
              lng:parseFloat(el2.geometry.coordinates[0])
            };
            let dis1 = getDistance(center,p21);
            let dis2 = getDistance(center,p22);
            return dis1 - dis2;
          }).slice(0,1800).filter(el=> {
            let p2 = {
              lat:parseFloat(el.geometry.coordinates[1]),
              lng:parseFloat(el.geometry.coordinates[0])
            };
            return getDistance(center,p2) <= dist;
          });
          resolve(filteredData);
        });
      }

        return new Promise((resolve,reject)=>{
          axios
          .get(globalSettings.locationMainURL)
          .then(response => {
              data = response.data;
              updateTime = (new Date()).getTime();
              try{
                localStorage.setItem('baseData',JSON.stringify(data));
                localStorage.setItem('updateTime',updateTime);
              }catch (e) {
                window.HDataBase = data;
              }
              let filteredData = data;
              filteredData.results = data.results.sort((el1,el2)=>{
                let p21 = {
                  lat:parseFloat(el1.geometry.coordinates[1]),
                  lng:parseFloat(el1.geometry.coordinates[0])
                };
                let p22 = {
                  lat:parseFloat(el2.geometry.coordinates[1]),
                  lng:parseFloat(el2.geometry.coordinates[0])
                };
                let dis1 = getDistance(center,p21);
                let dis2 = getDistance(center,p22);
                return dis1 - dis2;
              }).slice(0,1800).filter(el=> {
                  let p2 = {
                    lat:parseFloat(el.geometry.coordinates[1]),
                    lng:parseFloat(el.geometry.coordinates[0])
                  };
                  return getDistance(center,p2) <= dist;
                });
              resolve(filteredData);
          }).catch(e=>{
            console.log(e)
          });
        })
    }else{
        return new Promise((resolve, reject) => {
          data = JSON.parse(data);
          let filteredData = data;
          filteredData.results = data.results.sort((el1,el2)=>{
            let p21 = {
              lat:parseFloat(el1.geometry.coordinates[1]),
              lng:parseFloat(el1.geometry.coordinates[0])
            };
            let p22 = {
              lat:parseFloat(el2.geometry.coordinates[1]),
              lng:parseFloat(el2.geometry.coordinates[0])
            };
            let dis1 = getDistance(center,p21);
            let dis2 = getDistance(center,p22);
            return dis1 - dis2;
          }).slice(0,1800).filter(el=> {
              let p2 = {
                lat:parseFloat(el.geometry.coordinates[1]),
                lng:parseFloat(el.geometry.coordinates[0])
              };
              return getDistance(center,p2) <= dist;
            });
          resolve(filteredData);
      });
    }

    // return new Promise((resolve, reject) => {
    //   axios
    //     .get(getLocationsURLForRadius(center, dist, serviceKeyword))
    //     .then(response => {
    //       resolve(response.data);
    //     });
    // });
  }

  /* Component lifecycle events */

  componentDidMount() {
    this.locateUser(this.props.useLocateFlag);
  }

  componentDidUpdate(prevProps) {
    if (this.props.mapCenter !== prevProps.mapCenter) {
      const zoom = this.props.zoomIn
        ? this.zoomInLevel
        : this.state.willZoomOut
        ? this.zoomOutLevel
        : this.props.postCodeSearch? 14:this.defaultZoomLevel;

      const newMapProps = Object.assign({}, this.state.mapProps, {
        bounds: this.state.mapProps.bounds,
        center: this.props.mapCenter,
        zoom: zoom
      });

      this.setState({ mapProps: newMapProps, willZoomOut: false });
    }

    if (this.props.locations !== prevProps.locations) {
      this.doCluster(this.state.mapProps, this.props.locations);
    }

    if (this.props.selectedLocation !== prevProps.selectedLocation) {
      if (!this.props.selectedLocation.name) {
        return;
      }

      this.setState({
        mapProps: {
          zoom: this.props.zoomIn ? this.zoomInLevel : this.state.mapProps.zoom
        }
      });
    }

    if (this.props.defaultLocation && this.state.defaultLocation) {
      this.setState({
        isLocating: false,
        defaultLocation: null,
        initialLocationSet: true
      });
      this.getData(this.props.mapCenter, 4, this.state.serviceKeyword).then(
        response => {
          this.props.handleDataReceived(response.results);
        }
      );
    }

    if (this.state.defaultLocationId) {
      this.setState({
        isLocating: false,
        defaultLocation: null,
        initialLocationSet: true,
        defaultLocationId: null
      });
      this.centerMapTo(this.props.defaultLocationCoordinates);
    }
  }

  /* Event handlers */

  onGoogleApiLoaded(map, maps) {
    this.setState({ googleMapReference: map });
  }

  onMapEvent(props) {
    this.setState({ mapProps: props });

    if (!props.bounds) {
      return;
    }

    const dist = getDistance(props.center || this.props.mapCenter, {
      lat: props.bounds.nw.lat,
      lng: props.bounds.nw.lng
    });

    if (!this.state.isLocating) {
      this.getData(props.center, dist, this.state.serviceKeyword).then(
        response => {
          this.props.handleDataReceived(response.results);
        }
      );
    }
  }

  onSelectLocation(location, showDetails, center) {
    this.props.handleSelectLocation(
      location,
      showDetails,
      center,
      this.state.googleMapReference
    );
  }

  onUserLocated(position) {
    console.log("user located");
    window.clearTimeout(this.locateTimeout);
    this.setState({ userLocation: position, isLocating: false });

    if (this.state.initialLocationSet) {
      return;
    }

    if (!this.state.defaultLocation && !this.state.defaultLocationId) {
      this.setState(
        { initialLocationSet: true, userLocation: position },
        () => {
          this.centerMapTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      );

      // fix for bug where map doesn't correctly update after centering
      if (this.state.googleMapReference) {
        const mapCoords = this.state.googleMapReference.center;
        const userCoords = position.coords;

        if (
          Math.round(mapCoords.lat() * 1000) / 1000 !==
            Math.round(userCoords.latitude * 1000) / 1000 ||
          Math.round(mapCoords.lng() * 1000) / 1000 !==
            Math.round(userCoords.longitude * 1000) / 1000
        ) {
          this.centerMapTo({
            lat: userCoords.latitude - 0.00001,
            lng: userCoords.longitude - 0.00001
          });
        }
      }
    } else {
      this.setState({ defaultLocation: null, initialLocationSet: true }, () => {
        this.centerMapTo(this.props.mapCenter);
        this.onMapEvent(this.state.mapProps);
      });
    }
  }

  onUserLocationFailed() {
    console.log("failed to locate user");
    if (
      (!this.state.isLocating && this.state.initialLocationSet) ||
      this.state.defaultLocation
    ) {
      return;
    }

    window.clearTimeout(this.locateTimeout);

    this.setState({
      defaultLocation: null,
      isLocating: false,
      initialLocationSet: true,
      willZoomOut: true
    });

    if (!this.state.locations.length) {
      this.centerMapTo(this.defaultMapProps.center);
    }
  }

  /* Component methods */

  doCluster(props, locations = this.state.locations) {
    if (!props.bounds) {
      return;
    }

    const clusters = new supercluster({
      radius: 150,
      minZoom: 1,
      maxZoom: this.zoomInLevel - 1
    });

    clusters.load(locations);

    this.setState({
      clusteredLocations: clusters.getClusters(
        [
          props.bounds.nw.lng,
          props.bounds.sw.lat,
          props.bounds.ne.lng,
          props.bounds.nw.lat
        ],
        props.zoom
      )
    });
  }

  centerMapTo(position) {
    this.props.handleCenterChange(position);
  }


  locateUser(autoCenterToUserLocation = true) {
    if (navigator.geolocation) {
      this.setState({
        initialLocationSet: false,
        isLocating: autoCenterToUserLocation
      });
      navigator.geolocation.getCurrentPosition(
        this.onUserLocated,
        this.onUserLocationFailed
      );

      this.locateTimeout = window.setTimeout(() => {
        this.onUserLocationFailed();
      }, 10000);
    } else {
      this.onUserLocationFailed();
    }
  }


  render() {
    const markers = this.state.clusteredLocations.map(location => {
      if (location.name) {
        const isActive = this.props.selectedLocation.name === location.name;
        const isHighlighted =
          this.props.highlightedLocation &&
          this.props.highlightedLocation.name &&
          this.props.highlightedLocation.name === location.name;

        return (
          <MapMarker
            active={isActive}
            handleDetailsClick={this.props.handleDetailsClick}
            handleDetailsHide={this.props.handleDetailsHide}
            handleSelectLocation={this.onSelectLocation}
            handleMouseOver={this.props.handleHighlightLocation}
            highlighted={isHighlighted}
            key={location.id}
            lat={location.geometry.coordinates[1]}
            lng={location.geometry.coordinates[0]}
            location={location}
            selectedLocation={this.props.selectedLocation}
          />
        );
      } else {
        return (
          <ClusterMarker
            count={location.properties.point_count_abbreviated}
            key={location.properties.cluster_id}
            lat={location.geometry.coordinates[1]}
            lng={location.geometry.coordinates[0]}
            location={location}
          />
        );
      }
    });

    const userMarker = !this.state.userLocation.coords ? (
      ""
    ) : (
      <UserMarker
        lat={this.state.userLocation.coords.latitude}
        lng={this.state.userLocation.coords.longitude}
      />
    );

    return (
      <div className="c-map-container__inner">
        <button
          className="c-map__locate-btn"
          onClick={this.locateUser}
          disabled={this.state.isLocating}
        >
          Use my location
        </button>

        <GoogleMapReact
          bootstrapURLKeys={{ key: globalSettings.googleMapsAPIKey, v: "3.40" }}
          defaultZoom={this.defaultMapProps.zoom}
          onChange={this.onMapEvent}
          options={this.createMapOptions}
          zoom={this.state.mapProps.zoom}
          center={this.props.mapCenter}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) =>
            this.onGoogleApiLoaded(map, maps)
          }
          ref="map"
          resetBoundsOnResize={true}
        >
          {markers}
          {userMarker}
        </GoogleMapReact>
      </div>
    );
  }
}

export default MapContainer;

MapContainer.propTypes = {
  autoCenterToUserLocation: PropTypes.bool,
  centerIn: PropTypes.bool,
  defaultLocation: PropTypes.string,
  defaultLocationId: PropTypes.string,
  defaultLocationCoordinates: PropTypes.object,
  handleCenterChange: PropTypes.func,
  handleHighlightLocation: PropTypes.func,
  handleDataReceived: PropTypes.func,
  handleDetailsClick: PropTypes.func,
  handleDetailsHide: PropTypes.func,
  handleLocationInput: PropTypes.func,
  handleSelectLocation: PropTypes.func,
  highlightedLocation: PropTypes.object,
  locations: PropTypes.array,
  mapCenter: PropTypes.object,
  selectedLocation: PropTypes.object,
  zoom: PropTypes.number,
  zoomIn: PropTypes.bool
};

MapContainer.defaultProps = {
  mapCenter: { lat: -28.570000000000007, lng: 132.08000000000004 }
};
