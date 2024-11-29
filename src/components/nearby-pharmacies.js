import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import getDistance from '../helpers/get-distance';
import getOpeningHours from '../helpers/get-opening-hours';
import moment from 'moment';
import fixURL from '../helpers/fix-url';
import fapIcon from '../imgs/find-a-pharmacy-icon.png';
import OpeningHours from './opening-hours';

const NearbyPharmacies = ({ locations, origin }) => {
    console.log('NEARBY:', locations);
    console.log('ORIGIN:', origin);

    if (typeof origin === 'object' && origin !==null){
        origin = `${origin.latitude},${origin.longitude}`;
    }

    const directionsClick = (d) => {
        console.log('directions:',d);
        window.open('https://www.google.com/maps/dir/?api=1&destination='+d[0]+','+d[1],'_blank');
    };

    const bookingsClick = (d) => {        
        window.open(fixURL(d[0]), '_blank');
    };

    const moreInfoClick = (loc, origin) => {
        const url = 'https://findapharmacy.com.au/new/pharmacy?pharmacyId='+loc+'&origin='+origin;
        console.log('NEW URL:',url);
        window.location.href = url;
    };

    console.log("NEARBY", locations);

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

    const formatPhoneNumber = (phoneNumber) => {
        if(!phoneNumber) return '';
        let phoneStr = String(phoneNumber);

        let formattedNumber = phoneStr.startsWith('+61')
        ? '0' + phoneStr.slice(3)
        : phoneStr;

        return formattedNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
    };

    const openingHoursToday = (location) => {
        const today = moment().format('dddd').toLowerCase();
        const todayDate = moment().format('YYYY/MM/DD');
        let exceptionFlag = false;
        let todayOpening = "";
      
        // Check for holiday hours (exceptions)
        if (location.holidayHours) {
          let data = location.holidayHours;
          for (let i = 0; i < data.length; i++) {
            if (data[i].date === todayDate) {
              todayOpening = (data[i].open === "Closed") 
                ? `Closed (${data[i].reason})` 
                : `${data[i].open} to ${data[i].close} (${data[i].reason})`;
              exceptionFlag = true;
              break;  // stop loop after finding today's holiday hour
            }
          }
        }
      
        // If no exceptions, use standard hours for today
        if (!exceptionFlag) {
          todayOpening = todayHours(location);
        }
      
        return todayOpening;
    };
      
    // Get today's opening hours
    const todayHours = (location) => {
        const today = moment().format('dddd').toLowerCase();
        const hours = location[today];
        
        //console.log('Today hours:', hours);
        
        if (hours && hours.open) {
            return `${hours.open} to ${hours.close}`;
        } else {
            return "Closed Today";
        }
    };

    const getDistance = (origin, coords) => {
        //console.log('GET DISTANCE');
        //console.log('origin:', origin);
        //console.log('coords:', coords);
        const toRadians = (degrees) => degrees * (Math.PI / 180);


        console.log('getDistance origin = ',origin);
        console.log('getDistance coords= ', coords);
        const [lat1, lon1] = origin.split(',').map(Number);
        const lat2 = coords[0];
        const lon2 = coords[1];

        //console.log('coords:',lat1, lon1, lat2, lon2);

        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers

        return distance.toFixed(2);
    };
    

    return (
      <div className="nearest-pharmacy__list-wrapper">
        {locations && locations.length > 0 ? (
            locations.map((location, index) => (
            <div key={index} className="nearest-pharmacy__single-item result-listing-single-item">
                <div className="nearest-pharmacy__pharmacy-icon result-listing-icon">
                    <img src={fapIcon} alt={`Find a Pharmacy Icon - ${location.name}`}/>
                </div>
                <div className="nearest-pharmacy__pharmacy-details result-listing-details">
                    <h3 className="nearest-pharmacy__pharmacy-name result-listing-pharmacy-name">{location.name}</h3>
                    <p className="nearest-pharmacy__details result-listing-content small"><strong>Open: </strong>{openingHoursToday(location)} | <OpeningHours location={location}/></p>
                    <p className="nearest-pharmacy__details result-listing-content small"><strong>Address: </strong>{addressBlock(location)}</p>
                    <p className="nearest-pharmacy__details result-listing-content small"><strong>Phone: </strong>{formatPhoneNumber(location.phone)}</p>
                    <p className="nearest-pharmacy__details result-listing-content small"><strong>Distance: </strong>{getDistance(origin, location.geometry.coordinates)}km</p>
                </div>
                <div className="nearest-pharmacy__search-actions result-listing-actions">
                    <div className="nearest-pharmacy__search-actions results-listing-actions-two-buttons search-actions-two-buttons">
                        {location?.bookingurl ? (
                            <button className="nearest-pharmacy__bookings button-yellow btn-with-backdrop btn btn-secondary" aria-label={`Book an appointment with ${location.name}`} onClick={()=>bookingsClick(location.bookingurl)}>
                                <div className="backdrop">
                                    <i className="fa-solid fa-calendar-days"></i> Book Now
                                </div>
                                <div className="overlay">
                                    <i className="fa-solid fa-calendar-days"></i> Book Now
                                </div>
                            </button>
                        ): location?.phone ? (
                            <button className="fap-map-popup__for-bookings button-yellow btn-with-backdrop btn" aria-label={`Call now - ${location.name}`} onClick={() => window.open(`tel:${formatPhoneNumber(location.phone)}`, '_blank')}>
                              <div className="backdrop"><i className="fa-solid fa-phone"></i> Call Now</div>
                              <div className="overlay"><i className="fa-solid fa-phone"></i> Call Now</div>
                            </button>
                          ) : (
                            <p>&nbsp;</p>
                          )}
                        <button className="nearest-pharmacy__directions button-lightblue btn-with-backdrop btn btn-secondary" aria-label={`Get directions to ${location.name}`} onClick={()=>directionsClick(location.geometry.coordinates)}>
                            <div className="backdrop">
                                <i className="fa-solid fa-map-location-dot"></i> Get Directions
                            </div>
                            <div className="overlay">
                                <i className="fa-solid fa-map-location-dot"></i> Get Directions
                            </div>
                        </button>
                    </div>
                    <div className="nearest-pharmacy__search-actions result-listing-actions-one-button">
                        <button className="nearest-pharmacy__more-info button-blue btn-with-backdrop btn btn-secondary" aria-label={`Find out more about ${location.name}`} onClick={()=>moreInfoClick(location.id, location.geometry.coordinates)}>
                            <div className="backdrop">Get more Info</div>
                            <div className="overlay">Get more Info</div>
                        </button>
                    </div>
                </div>
            </div>
            ))
        ) : (
            <p>Not found</p>
        )}
      </div>
    );
  };



export default NearbyPharmacies;