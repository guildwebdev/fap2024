'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import Swal from 'sweetalert2';
import { trackCustom } from 'react-facebook-pixel';

import onSendUserAction from '../helpers/on-send-user-action';
import getOpeningHours from '../helpers/get-opening-hours';
import renderPropertyList from '../helpers/render-property-list';
import renderNonMemberServices from '../helpers/render-non-member-services';
import fapIcon from '../imgs/find-a-pharmacy-icon.png';
import getDistance from '../helpers/get-distance';
import OpeningHours from './opening-hours';


class MapMarker extends Component {
  constructor( props ) {
    super( props );
    this.onClose = this.onClose.bind( this );
    this.onDetailsClick = this.onDetailsClick.bind( this );
    this.onSelect = this.onSelect.bind( this );
    this.onMouseOut = this.onMouseOut.bind( this );
    this.onMouseOver = this.onMouseOver.bind( this );
    this.onBookingClicked = this.onBookingClicked.bind( this );
    this.openExternalModal = this.openExternalModal.bind (this );
    this.state = {
      latitude: null,
      longitude: null,
      error: null
    };
    this.isComponentMounted = false;
  }

  componentDidMount() {
    this.isComponentMounted = true;
    this.getLocation();
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }
   
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.isComponentMounted) {
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          }
        },
        (error) => {
          if (this.isComponentMounted) {
            this.setState({ error: error.message });
          }
        }
      );
    }
  }

  /* ---------- EVENT HANDLERS ---------- */
  onBookingClicked(e) {
    //Track 'Book Now' clicks
    //e.preventDefault();
    const safariWindow = window.open();
    onSendUserAction( this.props.location, 'Vaccination Booking', safariWindow);
    //return true;
  }

  openExternalModal(e){
    e.preventDefault();
    var name = this.props.location.name;
    Swal.fire({

      title: 'Attention',
      html: 'You are about to open the <strong>'+name+'</strong> website in a new tab/window.<br><br><strong>Find a Pharmacy</strong> will stay open in the background.',
      //html: 'Cya <strong>Dude</strong>',
      icon: 'question',
      confirmButtonText: 'Continue',
      cancelButtonText: 'Go back',
      showCancelButton: true,
      confirmButtonColor: '#00205b',
      cancelButtonColor: '#ffc72c',
      iconColor: '#00205b',
    }).then((result) => {
      if (result.isConfirmed){
        this.onBookingClicked();
        return true;
      }
    })
  }


  onClose( e ) {
    //Close Pharmacy Modal
    e.preventDefault();
    
    if( !this.props.handleDetailsHide ) {
      this.props.handleSelectLocation( {} );
    } else {
      this.props.handleDetailsHide();

      const t = window.setTimeout(() => {
        this.props.handleSelectLocation( {} );
      }, 250 );
    }
  }

  onDetailsClick( e ) {
    //Show all Pharmacy Details in LHS
    e.preventDefault();
    this.props.handleDetailsClick( this.props.location);
  }

  onMouseOut() {
    //Mouse is no longer hovering over Pharmacy Pin
    if( this.props.handleMouseOver ) {
      this.props.handleMouseOver( {} );
    }
  }

  onMouseOver() {
    //Mouse is hovering over Pharmacy Pin
    if( this.props.handleMouseOver ) {
      this.props.handleMouseOver( this.props.location );
    }
  }

  

  onSelect( e ) {
    //Pharmacy Pin is clicked
    e.preventDefault();

    console.log('Location data:', this.props.location);
    console.log('Opening hours', getOpeningHours(this.props.location));

    this.props.handleSelectLocation( this.props.location, false, this.willCenterToMarker( e.target ) );
  }

  /* ---------- COMPONENT METHODS ---------- */

  willCenterToMarker( marker ) {
    //Moves map focus to center after click
    const parent = marker.parentNode.parentNode;
    const relativeOffsetLeft = marker.getBoundingClientRect().left - window.scrollX;
    const isMobile = window.innerWidth < 600;
    const cutoffTop = 280;
    const cutoffLeft = 160;
    
    return isMobile ? true : (
      parent.offsetTop < cutoffTop || 
      parent.offsetLeft < cutoffLeft || 
      ( window.innerWidth - relativeOffsetLeft ) < 200
    );
  }

  /* ---------- RENDER METHOD ---------- */
  render() {
    var services;
    var nonMemberServices;
    const myServices = this.props.location.services ;
    var modernaVax, modernaVaxKids, pfizerVax, pfizerVaxKids, novavaxVax, fluVax, lagevrioTreat, paxlovidTreat;
    var pallCareBlurb = false;
    var pallCareClass;
    var saPallCareBlurb = false;
    var saPallCareClass;

    const distance = (this.state.latitude && this.state.longitude) ? 
    getDistance(
      { lat: this.state.latitude, lng: this.state.longitude },
      { lat: parseFloat(this.props.location.geometry.coordinates[1]), 
        lng: parseFloat(this.props.location.geometry.coordinates[0]) }
    ) / 1000 : null;

    //Print Services List
    if (this.props.location.memberType == 'Premises' || this.props.location.memberType == 'Non-Member Ineligible AFSPA'){
      //All services for Members and AFSPA
      services = renderPropertyList( this.props.location, 'services', 4 );
    } else {
      //Only print 'Palliative Care Support' for Non-Members
      if (myServices && myServices.indexOf('Palliative Care Prepared') !==-1) {
        nonMemberServices = "Palliative Care Prepared";
      } 
      if (myServices && myServices.indexOf('Palliative Care Medicines Pharmacy Network – SA initiative') !==-1){
        nonMemberServices = "Palliative Care Medicines Pharmacy Network – SA initiative";
      }
      var nmData = nonMemberServices;
      services = renderNonMemberServices(nmData, 2);
    }

    //Print TAS Palliative Care Blurb
    if (this.props.location.state == 'TAS') {
      if (myServices && myServices.indexOf('Palliative Care Prepared') !==-1) {
        pallCareBlurb = true;
        pallCareClass = "c-map__info-bubble__pallcare";
      }
    }

    if (this.props.location.state == 'SA') {
      if (myServices && myServices.indexOf('Palliative Care Medicines Pharmacy Network – SA initiative') !==-1){
        saPallCareBlurb = true;
        saPallCareClass = "c-map__info-bubble__pallcare";
      }
    }

    //Print Vaccination & COVID Services
    //Only show for Members and AFSPA
    if (this.props.location.memberType == 'Premises' || this.props.location.memberType == 'Non-Member Ineligible AFSPA'){
      //Moderna Vaccine
      if (myServices && myServices.indexOf('(Moderna)') !==-1) {
        modernaVax = 'COVID-19 (Moderna)';
      }
      //Moderna (6-11) Vaccine
      if (myServices && myServices.indexOf('Moderna ages 6-11') !==-1) {
        modernaVax = 'COVID-19 (Moderna 6-11)';
      }
      //Pfizer Vaccine
      if (myServices && myServices.indexOf('(Pfizer)') !==-1) {
        pfizerVax = 'COVID-19 (Pfizer)';
      }
      //Pfizer (5-11) Vaccine
      if (myServices && myServices.indexOf('Pfizer ages 5-11') !== -1) {
        pfizerVaxKids = 'COVID-19 (Pfizer 5-11)';
      } 
      //Novavax Vaccine
      if (myServices && myServices.indexOf('Novavax') !== -1) {
        novavaxVax = 'COVID-19 (Novavax)';
      } 
      //Lagevrio Treatment
      if (myServices && myServices.indexOf('LAGEVRIO') !== -1) {
        lagevrioTreat = 'Lagevrio®'
      }
      //Paxlovid Treatment
      if (myServices && myServices.indexOf('PAXLOVID') !== -1) {
        paxlovidTreat = 'Paxlovid®';
      }
      //Flu Vaccine
      if (myServices && myServices.indexOf('Influenza') !==-1){
        fluVax = 'Influenza';
      }
    }

    //Add classes to Pharmacy Modal Container
    var containerClasses = classNames({
      'fap-map__location-container': true,
      'is-highlighted': this.props.highlighted
    });

    //Add 'Hidden' class to Non-Member Pharmacies - UNLESS they offer Palliative Care, and are in TAS
    if (this.props.location.memberType == "Non-Member"){
      //Pharmacies that don't offer Palliative Care
      if (myServices && (myServices.indexOf('Palliative Care Prepared') == -1 || myServices.indexOf('Palliative Care Medicines Pharmacy Network – SA initiative'))){
        containerClasses = classNames({
          'fap-map__location-container': true,
          'hidden': true,
        });
      } else {
        //Pharmacies that do offer Palliative Care, but aren't in TAS
        if (this.props.location.state != 'TAS' || this.props.location != 'SA'){
          containerClasses = classNames({
            'fap-map__location-container': true,
            'hidden': true,
          });
        }
      }
    }

    //Add classes to Pharmacy Modal Info
    const bubbleClasses = classNames({
      'fap-map-popup hidden': true,
      'active': this.props.active,
     });

    //Add classes to Modal Heading
    var bubbleHeadingClasses = classNames({
      'fap-map-popup__details': true
    });

    //Add classes to Pharmacy Pin
    var mapMarkerClasses = classNames({
      'fap-map__location': true
    });

    //Add classes for Pharmacy Modal Icon
    if (this.props.location.memberType == 'Premises'){
      //Default Icon for Members
    } else if (this.props.location.memberType == 'Non-Member Ineligible AFSPA'){
      //AFSPA Icon
      bubbleHeadingClasses = classNames({
        'fap-map-popup__details': true,
        'afspa':true
      });
      mapMarkerClasses = classNames({
        'fap-map__location': true,
        'afspa':true
      });
    } else if (this.props.location.memberType == null) {
      //Null Member Type is Hidden
      mapMarkerClasses = classNames({
        'fap-map__location': true,
        'hidden': true
      });
    } else {
      //Non-Member Icon
      bubbleHeadingClasses = classNames({
        'fap-map__location': true,
        'nonmember':true
      });
      mapMarkerClasses = classNames({
        'fap-map__location': true,
        'nonmember':true
      });
    }

    
    //Print Call to Action Button
    const renderButton = () => {
      if (this.props.location.bookingurl){ 
        //Print 'Book Now' button if Booking URL is available
        //Has extra paramaters attached for GA4 tracking
        //return(<p><a href={this.props.location.bookingurl} onClick={this.onBookingClicked} className="button" data-pharmacy={this.props.location.id} data-action="book-now" data-state={this.props.location.state}>Book now</a></p>);
        return(<p><a href={this.props.location.bookingurl} onClick={this.openExternalModal} className="button" data-pharmacy={this.props.location.id} data-action="book-now" data-state={this.props.location.state}>Book now</a></p>);
      } else {
        //Print 'Call Now' button if no Booking URL, AND if Vaccine services are offered
        if (this.props.location.phone){
          if (myServices && myServices.indexOf('COVID') !== -1 || myServices && myServices.indexOf('Influenza') !== -1){
             return(<p><a href={'tel:'+cleanPhone} className="button" data-pharmacy={this.props.location.id} data-action="call-now" data-state={this.props.location.state}>Call Now</a></p>);
          } else {
             return null;
          }        
        } else {
          //Otherwise, don't print button
          return null;
        }
      }
    };

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
          return `${d.open} to ${d.close}`;
        } else {
          return "Closed Today";
        }
    };
    
    //Process Phone Number
    const cleanPhone = (phoneNumber) => {
      if(!phoneNumber) return '';

      let formattedNumber = phoneNumber.startsWith('+61')
      ? '0' + phoneNumber.slice(3)
      : phoneNumber;

      return formattedNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
    }

    const directionsButton = (lat, long) => {
      if (!lat || !long) return '';

      let directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
      return directionsUrl;
    }

    //GET DISTANCE
    const distanceInMeters = getDistance(
      { lat: this.props.userLocationLat, lng: this.props.userLocationLong },
      { lat: this.props.location.geometry.coordinates[1], lng: this.props.location.geometry.coordinates[0] }
    );
    const distanceInKm = (distanceInMeters / 1000).toFixed(2);

    //RETURNED HTML
    return (

      
      <div className={containerClasses}>
        <div 
          className={mapMarkerClasses} 
          onClick={this.onSelect} 
          onMouseEnter={this.onMouseOver} 
          onMouseOut={this.onMouseOut}>
        </div>
        
        <div className={bubbleClasses}>
          <button className="fap-map-popup__btn-close btn-close" onClick={this.onClose} aria-label="Close"></button>
          <div className={bubbleHeadingClasses}>
            <div className="fap-map-popup__pharmacy-icon d-none d-md-block">
              <img src={fapIcon} alt={`Find a Pharmacy Icon - ${this.props.location.name}`}/>
            </div>

            <div className="fap-map-popup__single-pharmacy">
              
              <div className="fap-map-popup__pharmacy-details">
                <h3 className="pharmacy-map__pharmacy-name result-listing-pharmacy-name">{ this.props.location.name }</h3>
                <p className="pharmacy-map__details result-listing-content small"><strong>Open: </strong>{ openingHoursToday() } <span className='d-none d-md-inline-block'>| <OpeningHours location={this.props.location}/></span> </p>
                <p className="pharmacy-map__details result-listing-content small"><strong>Address: </strong> { this.props.location.address + (this.props.location.address2? ', '+ this.props.location.address2:',') + (this.props.location.address3? ', '+ this.props.location.address3:',')} { this.props.location.city } {this.props.location.state}, { this.props.location.postcode }</p>
                {this.props.location?.phone && (
                  <p className="pharmacy-map__details result-listing-content small"><strong>Phone: </strong><span className='d-none d-md-inline-block'>{ cleanPhone(this.props.location.phone) }</span></p>
                )}                
                {this.props.location?.email && (
                  <p className="pharmacy-map__details result-listing-content small d-none d-md-block"><strong>Email: </strong><a href={`mailto:${this.props.location.email}`}>{this.props.location.email}</a></p>
                )}
                {(distance && !isNaN(distance)) && (
                  <p className="pharmacy-map__details result-listing-content small"><strong>Distance: </strong>{distance.toFixed(1)}km</p>
                )}
              </div>
            </div>   
            
            <div className="fap-map-popup__more-actions">
              <div className="fap-map-popup__actions">
                <div className="fap-map-popup__search-actions-two-buttons search-actions-two-buttons">
                  {this.props.location?.bookingurl ? (
                      <button className="fap-map-popup__for-bookings button-yellow btn-with-backdrop btn"  aria-label={`Book an appointment with ${this.props.location.name}`} onClick={() => window.open(this.props.location.bookingurl, '_blank')}>
                        <div className="backdrop"><i className="fa-solid fa-calendar-days"></i> Book Now</div>
                        <div className="overlay"><i className="fa-solid fa-calendar-days"></i> Book Now</div>
                      </button>
                    ) : this.props.location?.phone ? (
                      <button className="fap-map-popup__for-bookings button-yellow btn-with-backdrop btn"  aria-label={`Call Now - ${this.props.location.name}`} onClick={() => window.open(`tel:${cleanPhone(this.props.location.phone)}`, '_blank')}>
                        <div className="backdrop"><i className="fa-solid fa-phone"></i> Call Now</div>
                        <div className="overlay"><i className="fa-solid fa-phone"></i> Call Now</div>
                      </button>
                    ) : (
                      <p>&nbsp;</p>
                    )
                  }                  
                  <button className="fap-map-popup__for-directions button-lightblue btn-with-backdrop btn"  aria-label={`Get directions to ${this.props.location.name}`}onClick={() => window.open(directionsButton(this.props.location.geometry.coordinates[1], this.props.location.geometry.coordinates[0]), '_blank')}>
                    <div className="backdrop"><i className="fa-solid fa-map-location-dot"></i> Get Directions</div>
                    <div className="overlay"><i className="fa-solid fa-map-location-dot"></i> GetDirections</div>
                  </button>
                </div>
              </div>
              
              <div className="fap-map-popup__single-page my-4">
                <p className="small text-center"><a href={`/pharmacy?pharmacyId=${this.props.location.id}`} target="_blank"  aria-label={`Find out more about ${this.props.location.name}`} className="c-map__info-bubble__more-link">What do they offer me?</a></p>
              </div>
              
            </div>
          
          </div>
        </div>
                       
      </div>       
    );
  }
}

export default MapMarker;

MapMarker.propTypes = {
  active: PropTypes.bool,
  handleDetailsClick: PropTypes.func,
  handleDetailsHide: PropTypes.func,
  handleMouseOver: PropTypes.func,
  handleSelectLocation: PropTypes.func,
  highlighted: PropTypes.bool,
  location: PropTypes.object,
  selectedLocation: PropTypes.object,
}
