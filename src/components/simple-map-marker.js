import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import getOpeningHours from '../helpers/get-opening-hours';
import moment from 'moment';
import getDistance from '../helpers/get-distance';
import fapIcon from '../imgs/find-a-pharmacy-icon.png';

class SimpleMapMarker extends Component {
  constructor(props) {
    super(props);
    this.onSelect = this.onSelect.bind(this);
    this.state = {
      latitude: null,
      longitude: null,
      error: null,
    };
    this.isComponentMounted = false;
  }

  componentDidMount() {
    this.isComponentMounted = true;
    this.getLocation();
  }

  componentWillUnmount(){
    this.isComponentMounted = false;
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.isComponentMounted){
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        },
        (error) => {
          if (this.isComponentMounted){
            this.setState({ error: error.message });
          }
        }
      );
    } else {
      this.setState({ error: 'Geolocation is not supported by this browser.' });
    }
  }

  onSelect(e) {
    e.preventDefault();
    //this.props.handleSelectLocation(this.props.location, false, this.willCenterToMarker(e.target));
    this.props.handleSelectLocation(this.props.location, true, this.willCenterToMarker(e.target));
  }

  willCenterToMarker(marker) {
    const parent = marker.parentNode.parentNode;
    const relativeOffsetLeft = marker.getBoundingClientRect().left - window.scrollX;
    const isMobile = window.innerWidth < 600;
    const cutoffTop = 280;
    const cutoffLeft = 160;
    
    return isMobile ? true : (
      parent.offsetTop < cutoffTop || 
      parent.offsetLeft < cutoffLeft || 
      (window.innerWidth - relativeOffsetLeft) < 200
    );
  }

 


  render() {
    const {latitude, longitude, error} = this.state;

    console.log('SimpleMapMarker - location', this.props.location);
    console.log('User Location:',latitude, longitude, error);

    const currentStatus = getOpeningHours(this.props.location);
    //console.log('map-marker status: ',currentStatus);

    //FORMAT ADDRESS
    const streetAddress = [
      this.props.location.address,
      this.props.location.address2,
      this.props.location.address3
    ].filter(Boolean).join(', ');
    const cityAddress = [
      this.props.location.city, 
      this.props.location.state, 
      this.props.location.postcode
    ].filter(Boolean).join(' ');

    //FORMAT PHONE/FAX NUMBERS
    const formatPhoneNumber = (phoneNumber) => {
      if(!phoneNumber) return '';

      let formattedNumber = phoneNumber.startsWith('+61')
      ? '0' + phoneNumber.slice(3)
      : phoneNumber;

      return formattedNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
    }

    //DIRECTIONS BUTTON
    const directionsButton = (lat, long) => {
      if (!lat || !long) return '';

      let directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
      return directionsUrl;
    }

    //Process current day/time and compare to Pharmacy Opening Hours
    const today = moment().format('dddd').toLowerCase();
    const d = this.props.location[today];
    const xmas = "Fri Jan 26 2024";
    const todayDate = moment().format('YYYY/MM/DD');
    var exceptionFlag = false;

    const openingHoursToday = () => {
      let todayOpening = "";
      //Check for opening hour exceptions for today
      //If they exist, print them
      //Otherwise, print standard hours for today
      if (this.props.location.openingHourExceptions){
        var data = this.props.location.openingHourExceptions;
        for (var i = 0; i < data.length; i++){
          if (data[i].date == todayDate){
            todayOpening = (data[i].open === "Closed") ? `Closed (${data[i].reason})`: `Open ${data[i].open} to ${data[i].close} (${data[i].reason})`;
            exceptionFlag = true;
          }
        }      
      } else {
        todayOpening = todayHours();
      }

      if (exceptionFlag == false){
        todayOpening = todayHours();
      }

      return todayOpening;
    };

    //Get today's opening hours
    const todayHours = () => {
      //console.log('Today hours:', this.props.location[today]);
        if (this.props.location[today] && this.props.location[today].open){
          return `Open ${d.open} to ${d.close}`;
        } else {
          return "Closed Today";
        }
    };

    //GET DISTANCE
    const distanceInMeters = getDistance(
      { lat: latitude, lng: longitude },
      { lat: this.props.location.geometry.coordinates[1], lng: this.props.location.geometry.coordinates[0] }
    );
    const distanceInKm = (distanceInMeters / 1000).toFixed(2);


    const containerClasses = classNames({
      'c-map__marker-container': true,
      'is-highlighted': this.props.highlighted
    });

    const bubbleClasses = classNames({
      'c-map__info-bubble': true,
      'is-active': this.props.active,
    });

    const mapMarkerClasses = classNames({
      'c-map__marker': true
    });

    return (
      <div className="fap-map__location-container">
        <div className="fap-map__location"></div>

        <div className="fap-map-popup">
          <div className="fap-map-popup__details">
            <div className="fap-map-popup__pharmacy-icon">
              <img src={fapIcon} alt={`Find a Pharmacy Icon - ${this.props.location.name}`}/>
            </div>
            <div className="fap-map-popup__singlepharmacy">
              <div className="fap-map-popup__pharmacy-details">
                <h4>{this.props.location.name}</h4>
                <p className="pharmacy-map__details small"><strong>Open:</strong> { openingHoursToday() } | <span className="open-status open-status__opened">{currentStatus}</span></p>
                <p className="pharmacy-map__details small"><strong>Address:</strong> {streetAddress}, {cityAddress}</p>
                <p className="pharmacy-map__details small"><strong>Phone:</strong> {formatPhoneNumber(this.props.location.phone)} <a href={`tel:${formatPhoneNumber(this.props.location.phone)}`}>Call Now</a></p>
                <p className="pharmacy-map__details small"><strong>Email:</strong> <a href={`mailto:${this.props.location.email}`}>{this.props.location.email}</a></p>
                <p className="pharmacy-map__details small"><strong>Distance:</strong> {distanceInKm}km</p>
                                  
              </div>

              <div className="fap-map__more-actions">
                <div className="fap-map-popup__actions">
                  <div className="fap-map-popup__search-actions-two-buttons search-actions-two-buttons">
                    <button className="fap-map-popup__for-bookings button-yellow btn-with-backdrop btn" onClick={() => window.open(this.props.location.bookingurl, '_blank')}>
                      <div className="backdrop"><i className="fa-solid fa-calendar-days"></i>Book Now</div>
                      <div className="overlay"><i className="fa-solid fa-calendar-days"></i>Book Now</div>
                    </button>
                    <button className="fap-map-popup__for-directions button-lightblue btn-with-backdrop btn" onClick={() => window.open(directionsButton(this.props.location.geometry.coordinates[1], this.props.location.geometry.coordinates[0]), '_blank')}
  >
                      <div className="backdrop"><i className="fa-solid fa-map-location-dot"></i>Get Directions</div>
                      <div className="overlay"><i className="fa-solid fa-map-location-dot"></i>Get Directions</div>
                    </button>
                  </div>
                </div>
              </div>

            </div>
            
          </div>
        </div>
        </div>



      
    );
  }
}

SimpleMapMarker.propTypes = {
  mapCenter: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  active: PropTypes.bool,
  handleSelectLocation: PropTypes.func,
  highlighted: PropTypes.bool,
  location: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    monday: PropTypes.object,
    tuesday: PropTypes.object,
    wednesday: PropTypes.object,
    thursday: PropTypes.object,
    friday: PropTypes.object,
    saturday: PropTypes.object,
    sunday: PropTypes.object,
  }),
};

SimpleMapMarker.defaultProps = {
    active: true,
};

export default SimpleMapMarker;