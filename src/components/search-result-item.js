import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import renderPropertyList from '../helpers/render-property-list';
import onSendUserAction from '../helpers/on-send-user-action';
import Swal from 'sweetalert2';
import { property } from 'lodash';
import { trackCustom } from 'react-facebook-pixel';
import fapIcon from '../imgs/member-icon.png';
import fapIconAFSA from '../imgs/afspa-icon.png';
import fapIconNonMember from '../imgs/non-member-icon.png';
import OpeningHours from './opening-hours';
import fixURL from '../helpers/fix-url';
import getDistance from '../helpers/get-distance';
import { isIOS } from 'react-device-detect';

const SearchResultItem = props => {
  const today = moment().format('dddd').toLowerCase();
  const xmas = "Fri Jan 26 2024";
  const todayDate = moment().format('YYYY/MM/DD');

  /* Event handlers */
  const onBookingClicked = e => {
    //e.preventDefault();
    const safariWindow = window.open();
    onSendUserAction( props.result, 'Vaccination Booking', safariWindow );
    //return true;
  }

  const openExternalModal = e =>{
    e.preventDefault();
    var name = props.result.name;
    Swal.fire({

      title: 'Attention',
      html: 'You are about to open the <strong>'+name+'</strong> website in a new tab/window.<br><br><strong>Find a Pharmacy</strong> will stay open in the background.',
      icon: 'question',
      confirmButtonText: 'Continue',
      cancelButtonText: 'Go back',
      showCancelButton: true,
      confirmButtonColor: '#00205b',
      cancelButtonColor: '#ffc72c',
      iconColor: '#00205b',
    }).then((result) => {
      if (result.isConfirmed){
        onBookingClicked();
        return true;
      }
    })
  }

  const handleClick = e => {
    if (e.target.tagName.toLowerCase() === 'button') {
      return;
    }
    
    if (props.handleClick) {
      props.handleClick(props.result);
    }
  };

  const handleMouseLeave = e => {
    props.handleMouseOver( {} );
  };

  const handleMouseEnter = e => {
    props.handleMouseOver( props.result );
  };

  /* Computed properties */
  var exceptionFlag = false;
  const openingHours = () => {
    let todayOpening = '';
    //Check for exception hours for pharmacy
    //If today has exception hours, print them
    //Otherwise, print standard hours
    if (props.result.openingHourExceptions){
      var data = props.result.openingHourExceptions;
      for (var i = 0; i < data.length; i++){
        if (data[i].date == todayDate){
          todayOpening = (data[i].open == "Closed") ? `Closed (${data[i].reason})`: `${data[i].open} to ${data[i].close} (${data[i].reason})`;
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
      if (props.result[today] && props.result[today].open){
        return `${props.result[today].open} to ${props.result[today].close}`;
      } else {
        return "Closed Today";
      }
   };

   //Clean phone number so that tel: protocal can use it
   const cleanPhone = props.result.phone ? props.result.phone.replace(/\s/g,''):'';


      //Print 'Book Now' or 'Call Now' button
   const renderButton = () => {
    if (props.result.bookingurl){
      //return(<p><a href={props.result.bookingurl} onClick={onBookingClicked} className="button" data-pharmacy={props.result.id} data-action="book-now" data-state={props.result.state}>Book now</a></p>);
      return(<p><a href={props.result.bookingurl} onClick={openExternalModal} className="button" data-pharmacy={props.result.id} data-action="book-now" data-state={props.result.state}>Book now</a></p>);
    } else {
      if (props.result.phone){
        if (props.result.services){
          if (props.result.services.indexOf('COVID') !== -1 || props.result.services.indexOf('Influenza') !== -1){
            return(<p><a href={'tel:'+cleanPhone} className="button" data-pharmacy={props.result.id} data-action="call-now" data-state={props.result.state}>Call Now</a></p>);
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    }
  };

  const addressBlock = (d) => {
    //FORMAT ADDRESS
    const streetAddress = [
        d.address,
        d.address2,
        d.address3
    ].filter(Boolean).join(', ');
    const cityAddress = [
        d.city, 
        d.state, 
        d.postcode
    ].filter(Boolean).join(' ');
    return streetAddress+', '+cityAddress;
  };
  
  const directionsClick = (d) => {
    const url = 'https://www.google.com/maps/dir/?api=1&destination='+d[0]+','+d[1];
    return url;
  };

  const bookingsClick = (d) => {   
      window.open(fixURL(d), '_blank');
  };

  const moreInfoClick = (loc) => {
      const url = 'https://findapharmacy.com.au/pharmacy?pharmacyId='+loc;
      window.location.href = url;
  };

  const formatPhoneNumber = (phoneNumber) => {
    if(!phoneNumber) return '';
    let phoneStr = String(phoneNumber);

    let formattedNumber = phoneStr.startsWith('+61')
    ? '0' + phoneStr.slice(3)
    : phoneStr;

    return formattedNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
};

const distanceInMeters = getDistance(
  { lat: props.userLocationLat, lng: props.userLocationLong },
  { lat: props.result.geometry.coordinates[1], lng: props.result.geometry.coordinates[0] },
);
const distanceInKm = (distanceInMeters / 1000).toFixed(1);
  
  //Set style definitions
  var classes = classNames({
    's-filtered-search__results__item':true,
    'is-active': props.active,
    'is-highlighted': props.highlighted,
  });

  if (props.result.memberType == 'Non-Member'){
    if (props.result.services){
      if (props.result.services.indexOf('Palliative Care Prepared') == -1 || props.result.services.indexOf('Palliative Care Medicines Pharmacy Network') == -1){
        classes = classNames({
          's-filtered-search__results__item': true,
          'hideme': true,
        });
      }
    }
  }
  
  const itemClasses = classNames({
    'pharmacy-map__search-result-single-item': true,
    'result-listing-single-item': true,
    'is-highlighted': props.highlighted
  });

  if (props.result.memberType == 'Premises'){
    //leave classes as is
  } else if (props.result.memberType == "Non-Member Ineligible AFSPA") {
     classes = classNames({
      's-filtered-search__results__item':true,
      'afspa':true,
      'is-active': props.active,
      'is-highlighted': props.highlighted,
    });
  } else if (props.result.memberType == null) {
    classes = classNames({
      's-filtered-search__results__item': true,
      'hidden': true
    });
  } else {
    //hide non-members unless they are from TAS/SA and offering Palliative Care
    if (props.result.services){
      if (props.result.services.indexOf('Palliative Care Prepared') == -1 || props.result.services.indexOf('Palliative Care Medicines Pharmacy Network') == -1){
        classes = classNames({
          's-filtered-search__results__item':true,
          'nonmember':true,
          'is-active': props.active,
          'is-highlighted': props.highlighted,
          'hidden': true,
        });
      } else {
        if (props.result.state != 'TAS'){
          classes = classNames({
            's-filtered-search__results__item':true,
            'nonmember':true,
            'is-active': props.active,
            'is-highlighted': props.highlighted,
            'hidden': true,
          });
        } else if (props.result.start != 'SA') {
          classes = classNames({
            's-filtered-search__results__item':true,
            'nonmember':true,
            'is-active': props.active,
            'is-highlighted': props.highlighted,
            'hidden': true,
          });
        } else {
          classes = classNames({
            's-filtered-search__results__item':true,
            'nonmember':true,
            'is-active': props.active,
            'is-highlighted': props.highlighted,
          });
        }
      }
    } 
  }  

  //THIS IS WHAT GETS PRINTED ON SCREEN
  return (
    <div 
      className={itemClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pharmacy-map__pharmacy-icon result-listing-icon">
        <img 
          src={
          props.result.memberType === 'Premises'
          ? fapIcon
          : props.result.memberType === 'Non-Member Ineligible AFSPA'
          ? fapIconAFSA
          : fapIconNonMember
          } 
          alt={`Find a Pharmacy Icon - ${props.result.name}`}
        />
      </div>
      <div className="pharmacy-map__pharmacy-details result-listing-details">
        <h3 className="pharmacy-map__pharmacy-name result-listing-pharmacy-name">{props.result.name}</h3>
        <p className="pharmacy-map__details result-listing-content small"><strong>Open: </strong>{ openingHours() } | <OpeningHours location={props.result}/></p>
        <p className="pharmacy-map__details result-listing-content small"><strong>Address: </strong>{addressBlock(props.result)}</p>
        {(distanceInKm && !isNaN(distanceInKm)) && (
          <p className="pharmacy-map__details result-listing-content small"><strong>Distance: </strong>{distanceInKm}km</p>
        )}
        <p className="pharmacy-map__details result-listing-content small">
          <a href={directionsClick(props.result.geometry.coordinates)} target="_blank" aria-label={`Get directions to ${props.result.name}`}>
            <span className="pharmacy-map__details result-listing-content-direction-icon">
              <i className="fa-solid fa-paper-plane"></i>
            </span>
             Get Directions
          </a>
        </p>
      </div>
      <div className="pharmacy-map__search-actions result-listing-actions">
        <div className="pharmacy-map__search-actions result-listing-actions-two-buttons search-actions-two-buttons">
        {props.result?.bookingurl ? (
          isIOS ? (
            <button className="pharmacy-map__bookings button-yellow btn-with-backdrop btn btn-secondary" aria-label={`Book an appointment with ${props.result.name}`} data-url={props.result.bookingurl} onClick={()=>bookingsClick(props.result.bookingurl)}>
              <div className="backdrop"><i className="fa-solid fa-calendar-days"></i> Book Now</div>
              <div className="overlay"><i className="fa-solid fa-calendar-days"></i> Book Now</div>
            </button>
          ) : (
            <button className="pharmacy-map__bookings button-yellow btn-with-backdrop btn btn-secondary" aria-label={`Book an appointment with ${props.result.name}`} data-url={props.result.bookingurl} onClick={onBookingClicked}>
              <div className="backdrop"><i className="fa-solid fa-calendar-days"></i> Book Now</div>
              <div className="overlay"><i className="fa-solid fa-calendar-days"></i> Book Now</div>
            </button>
          )
        ): props.result?.phone ? (
          <button className="pharmacy-map__bookings button-yellow btn-with-backdrop btn btn-secondary"  aria-label={`Call now - ${props.result.name}`} data-phone={props.result.phone} onClick={() => window.open(`tel:${formatPhoneNumber(props.result.phone)}`, '_blank')}>
            <div className="backdrop"><i className="fa-solid fa-phone"></i> Call Now</div>
            <div className="overlay"><i className="fa-solid fa-phone"></i> Call Now</div>
          </button>
        ): (
          <p>&nbsp;</p>
        )}
          <button className="nearest-pharmacy__more-info button-blue btn-with-backdrop btn btn-secondary"  aria-label={`Find out more about ${props.result.name}`} data-info={props.result.id} onClick={() => {moreInfoClick(props.result.id)}}>
            <div className="backdrop">More Info <i className="fa-solid fa-arrow-right"></i></div>
            <div className="overlay">More Info <i className="fa-solid fa-arrow-right"></i></div>
          </button>
        </div>
      </div>      
    </div>
  );
}

export default SearchResultItem;

SearchResultItem.propTypes = {
  active: PropTypes.bool,
  handleClick: PropTypes.func,
  handleMouseOver: PropTypes.func,
  highlighted: PropTypes.bool,
  result: PropTypes.object,
}