import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import getDistance from '../helpers/get-distance';
import getOpeningHours from '../helpers/get-opening-hours';
import moment from 'moment';
import fixURL from '../helpers/fix-url';
import fapIcon from '../imgs/find-a-pharmacy-icon.png';

const NearbyPharmacies = ({ locations, origin }) => {

    console.log('NEARBY:', locations);

    const directionsClick = (d) => {
        window.open('https://www.google.com/maps/dir/?api=1&destination='+d[0]+','+d[1],'_blank');
    };

    const bookingsClick = (d) => {        
        window.open(fixURL(d[0]), '_blank');
    };

    const moreInfoClick = (loc, origin) => {
        const url = 'https://www.findapharmacy.com.au/new/pharmacy?pharmacyId='+loc+'&origin='+origin;
        console.log('NEW URL:',url);
        window.location.href = url;
    };

    //console.log("NEARBY", locations);

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
                : `Open ${data[i].open} to ${data[i].close} (${data[i].reason})`;
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
            return `Open ${hours.open} to ${hours.close}`;
        } else {
            return "Closed Today";
        }
    };

    const getDistance = (origin, coords) => {
        //console.log('GET DISTANCE');
        //console.log('origin:', origin);
        //console.log('coords:', coords);
        const toRadians = (degrees) => degrees * (Math.PI / 180);

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
      <div className="pharmacy-map__results">
        {locations && locations.length > 0 ? (
            locations.map((location, index) => (
            <div key={index} className="pharmacy-map__result-single-item">
                <div className="pharmacy-map__pharmacy-icon">
                    <img src={fapIcon} alt={`Find a Pharmacy Icon - ${location.name}`}/>
                </div>
                <div className="pharmacy-map__pharmacy-details">
                <h3 className="pharmacy-map__pharmacy-name">{location.name}</h3>
                <p className="pharmacy-map__details small"><strong>Open: </strong>{openingHoursToday(location)}</p>
                <p className="pharmacy-map__details small"><strong>Address: </strong>{addressBlock(location)}</p>
                <p className="pharmacy-map__details small"><strong>Phone: </strong>{formatPhoneNumber(location.phone)} <a className="pharmacy-map__phone-link" href={`tel:${formatPhoneNumber(location.phone)}`}>Call Now</a></p>
                <p className="pharmacy-map__details small"><strong>Distance: </strong>{getDistance(origin, location.geometry.coordinates)}km</p>
                </div>
                <div className="pharmacy-map__search-actions">
                    <div className="pharmacy-map__search-actions-two-buttons search-actions-two-buttons">
                        {location.bookingurl && (
                            <button className="pharmacy-map__for-bookings button-yellow btn-with-backdrop btn btn-primary" onClick={()=>bookingsClick(location.bookingurl)}>
                                <div className="backdrop">
                                    <i className="fa-solid fa-calendar-days"></i> Book Now
                                </div>
                                <div className="overlay">
                                    <i className="fa-solid fa-calendar-days"></i> Book Now
                                </div>
                            </button>
                        )}
                        <button className="pharmacy-map__for-directions button-lightblue btn-with-backdrop btn btn-primary" onClick={()=>directionsClick()}>
                            <div className="backdrop">
                                <i className="fa-solid fa-map-location-dot"></i> Get Directions
                            </div>
                            <div className="overlay">
                                <i className="fa-solid fa-map-location-dot"></i> Get Directions
                            </div>
                        </button>
                    </div>
                    <div className="pharmacy-map__search-actions-one-button">
                        <button className="pharmacy-map__for-more-info button-blue btn-with-backdrop btn btn-primary" onClick={()=>moreInfoClick(location.id, origin)}>
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