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
import initDatabase from "../settings/init-database";

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
      currSuperCluster: null,
      clusterClicked : false,
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
    this.zoomInLevel = 15;
    this.zoomOutLevel = 5;
    this.distRecord = 0;
    this.zoomLevelDist = 15;

    this.centerMapTo = this.centerMapTo.bind(this);
    this.locateUser = this.locateUser.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);
    this.onMapEvent = this.onMapEvent.bind(this);
    this.onSelectLocation = this.onSelectLocation.bind(this);
    this.onUserLocated = this.onUserLocated.bind(this);
    this.onUserLocationFailed = this.onUserLocationFailed.bind(this);
    this.getData = this.getData.bind(this);
  }

  getZoomLevelByDist(){
    if (this.distRecord > 3000){
      this.zoomLevelDist = 14;
    }else{
      this.zoomLevelDist = 15;
    }
  }

  getData(center, dist, serviceKeyword) {
    let updateTime = localStorage.getItem('updateTime');
    let currentTime = (new Date()).getTime();

    function getFilteredData(data){
      let filteredData = {};
      if(serviceKeyword){
        filteredData.results = data.sort((el1,el2)=>{
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
        }).filter(el=> {
          if (!el.services) return false;
          const match = el.services.indexOf(serviceKeyword) > -1;
          let p2 = {
            lat:parseFloat(el.geometry.coordinates[1]),
            lng:parseFloat(el.geometry.coordinates[0])
          };
          return (getDistance(center,p2) <= dist) && match;
        });
      }else{
        filteredData.results = data.sort((el1,el2)=>{
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
      }
      return filteredData;
    }

    function getFilteredDataNative(){
      return new Promise((resolve, reject) => {
        axios
          .get(getLocationsURLForRadius(center, dist, serviceKeyword))
          .then(response => {
            resolve(response.data);
          });
      });
    }

    function getReturn(){
      let updateTime = localStorage.getItem("updateTime");
      if (!updateTime){
        return getFilteredDataNative();
      }
      return new Promise((resolve,reject)=>{
        let database = indexedDB.open("baseData",parseInt(updateTime/1000000000));
  
        database.onsuccess = function(){
          let locations = database.result.transaction('locations',"readonly").objectStore("locations");
          locations.getAll().onsuccess = function(e){
            if (e.target.result.length < 1500){
              localStorage.removeItem("updateTime")
              initDatabase();
            }
            resolve(getFilteredData(e.target.result));
          }
        }

        database.onerror = async function(){
            resolve(await getFilteredDataNative())
        }
      });
    }


    return new Promise(async (resolve, reject) => {
        if(window.canIndexedDB){
          let returnData = await getReturn();
          resolve(returnData);
        }else{
          let returnData = await getFilteredDataNative();
          resolve(returnData);
        }
    });
  }

  /* Component lifecycle events */

  componentDidMount() {
    this.locateUser(this.props.useLocateFlag);
  }

  componentDidUpdate(prevProps) {

    if (this.props.mapCenter !== prevProps.mapCenter) {

      if (this.props.googleBounds && this.props.googleBounds.northeast && this.props.googleBounds.southwest){
        const dist = getDistance(this.props.googleBounds.northeast,this.props.googleBounds.southwest);
        if (dist >= 5000 && dist <10000){
          this.zoomLevelDist = 13;
          //this.zoomLevelDist = 14;
        }else if(dist >= 10000){
          //this.zoomLevelDist = 13;
          this.zoomLevelDist = 12;
        }else{
          this.zoomLevelDist = 15;
        }
      }

      const zoom = this.state.clusterClicked ? this.state.mapProps.zoom : this.props.zoomIn
        ? this.zoomInLevel
        : this.state.willZoomOut
        ? this.zoomOutLevel:this.zoomLevelDist;

      //console.log('zoom incoming');
      //console.log(zoom);

      const newMapProps = Object.assign({}, this.state.mapProps, {
        bounds: this.state.mapProps.bounds,
        center: this.props.mapCenter,
        zoom: zoom
      });

      this.setState({ mapProps: newMapProps, willZoomOut: false, clusterClicked : false });
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
      if (this.props.defaultMapCenter){
        this.centerMapTo(this.props.defaultMapCenter);
      }else {
        this.centerMapTo(this.defaultMapProps.center);
      }
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
      ),
      currSuperCluster: clusters,
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

  handleClusterClick(position){

    // added to get the correct zoom level for the selected cluster
    var zoom = this.state.currSuperCluster.getClusterExpansionZoom(position.id)
    this.setState({
      clusterClicked : true,
      zoomIn : true,
      mapProps : {
        zoom : zoom
      }
    });


    this.centerMapTo({
      lat:position.geometry.coordinates[1],
      lng:position.geometry.coordinates[0]
    });
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
            userLocationLat={this.props.userLatitude}
            userLocationLong={this.props.userLongitude}
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
            handleClusterClick = {(location)=>this.handleClusterClick(location)}
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
        <div className="location-container d-flex align-items-center">
          <button
            className="user-location btn btn-outline-primary"
            onClick={this.locateUser}
            disabled={this.state.isLocating}
          >
            <i className="fa-solid fa-location-dot"></i> 
          </button>
          <div className="location-group" onClick={this.locateUser}>
              <p>Use My Location</p>
            </div>
        </div>
        

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