import React from 'react';
import moment from 'moment';
import getDistance from '../helpers/get-distance';
import getOpeningHours from '../helpers/get-opening-hours';
import fixURL from '../helpers/fix-url';

const PharmacyDetails = ({ selectedLocation, userLocation }) => {
console.log('details location:', userLocation);

    //GET DISTANCE
    const distanceInMeters = getDistance(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        { lat: selectedLocation.geometry.coordinates[1], lng: selectedLocation.geometry.coordinates[0] }
    );
    const distanceInKm = (distanceInMeters / 1000).toFixed(2);

    //FORMAT ADDRESS
    const streetAddress = [
        selectedLocation.address,
        selectedLocation.address2,
        selectedLocation.address3
    ].filter(Boolean).join(', ');
    const cityAddress = [
        selectedLocation.city, 
        selectedLocation.state, 
        selectedLocation.postcode
    ].filter(Boolean).join(' ');

    //FORMAT PHONE/FAX NUMBERS
    const formatPhoneNumber = (phoneNumber) => {
        if(!phoneNumber) return '';

        let formattedNumber = phoneNumber.startsWith('+61')
        ? '0' + phoneNumber.slice(3)
        : phoneNumber;

        return formattedNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
    }

    //FORMAT OPENING HOURS
    const formatOpeningHours = (day) => {
        const dayLower = day.toLowerCase();
        if (selectedLocation[dayLower] && selectedLocation[dayLower].open && selectedLocation[dayLower].close){
            const openTime = moment(selectedLocation[dayLower].open, 'HH:mm').format('h:mm A');
            const closeTime = moment(selectedLocation[dayLower].close, 'HH:mm').format('h:mm A');
            return `${openTime} - ${closeTime}`;
        }
        return 'Closed';
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    //TODAY'S DATE
    //const currentStatus = getOpeningHours(selectedLocation);
    const getCurrentStatus = () => {
        const today = moment().format('YYYY/MM/DD');
        //const today = moment('2024-10-7').format('YYYY/MM/DD'); //Hardcode date for testing
        
        // Check if holiday hours exist and if today matches any holiday date
        if (selectedLocation.holidayHours && selectedLocation.holidayHours.date) {
            const holidayDates = selectedLocation.holidayHours.date.split('|');
            const holidayIndex = holidayDates.findIndex(date => date === today);
          
            if (holidayIndex !== -1) {
                // Today is a holiday, return holiday hours
                const holidayOpen = moment(selectedLocation.holidayHours.open.split('|')[holidayIndex],'HH:mm').format('h:mm A');
                const holidayClose = moment(selectedLocation.holidayHours.close.split('|')[holidayIndex],'HH:mm').format('h:mm A');
                return getOpeningHours({ 
                    [moment().format('dddd').toLowerCase()]: { open: holidayOpen, close: holidayClose } 
                });
            }
        }
        
        // If not a holiday, return standard opening hours
        return getOpeningHours(selectedLocation);
    };

    const currentStatus = getCurrentStatus();


    //HOLIDAY DATES
    const formatHolidayHours = (holidayHours) => {
        if (!holidayHours || !holidayHours.date) return [];

        const dates = holidayHours.date.split('|');
        const openTimes = holidayHours.open.split('|');
        const closeTimes = holidayHours.close.split('|');
        const reasons = holidayHours.reason.split('|');

        const uniqueDates = new Set();
        const uniqueHolidayHours = {};

        dates.forEach((date, index) => {
            if (!uniqueDates.has(date)){
                uniqueDates.add(date);

                const formattedDate = moment(date, 'YYYY/MM/DD').format('ddd Do MMM YYYY');
                const open = openTimes[index];
                const close = closeTimes[index];

                let formattedHours;

                if (open === 'Closed' || close === 'Closed'){
                    formattedHours = 'Closed';
                } else {
                    const formattedOpen = moment(open, 'HH:mm').format('h:mm A');
                    const formattedClose = moment(close, 'HH:mm').format('h:mm A');
                    formattedHours = `${formattedOpen} - ${formattedClose}`;
                }
                
                uniqueHolidayHours[date] = {
                    date: formattedDate, 
                    hours: formattedHours,
                    reason: reasons[index]
                };
            }
        });

        return Object.values(uniqueHolidayHours);
    }

    const formattedHolidayHours = formatHolidayHours(selectedLocation.holidayHours);

    //SERVICES
    const services = selectedLocation.services ? selectedLocation.services.split('|'): [];

    //LANGUAGES
    const languages = selectedLocation.language ? selectedLocation.language.split('|'): [];

    //CLEAN WEBSITE


  return (
    <div>
        <h4>{selectedLocation.name}</h4>
        <ul className="no-bullets">
            <li><strong>Open: </strong>{currentStatus}</li>
            <li><strong>Address: </strong>{streetAddress}, {cityAddress}</li>
            <li><strong>Phone: </strong>{formatPhoneNumber(selectedLocation.phone)} <a className="" href={`tel:${formatPhoneNumber(selectedLocation.phone)}`}>Call Now</a></li>
            <li><strong>Fax: </strong>{formatPhoneNumber(selectedLocation.fax)}</li>
            <li><strong>Email: </strong><a href={`mailto:${selectedLocation.email}`}>{selectedLocation.email}</a></li>
            <li><strong>Distance: </strong>{distanceInKm}km</li>
        </ul>

        <p>
            {selectedLocation.facebook && (
                <a 
                    href={fixURL(selectedLocation.facebook)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                >
                    <i className="fab fa-facebook"></i>
                </a>
            )}
            {selectedLocation.instagram && (
                <a 
                    href={fixURL(selectedLocation.instagram)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                >
                    <i className="fab fa-instagram"></i>
                </a>
            )}
            {selectedLocation.twitter && (
                <a 
                    href={fixURL(selectedLocation.twitter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                >
                    <i className="fab fa-twitter"></i>
                </a>
            )}
            {selectedLocation.website && (
                <a 
                    href={fixURL(selectedLocation.website)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                >
                    <i className="fas fa-globe"></i>
                </a>
            )}
        </p>

        {formattedHolidayHours.length > 0 &&(
            <ul className="no-bullets">
                <li><strong>Holiday Trading Hours</strong></li>
                {formattedHolidayHours.map((holiday, index) => (
                    <li key={index}>
                        {holiday.date} {holiday.hours} ({holiday.reason})
                    </li>
                ))}
            </ul>
        )}
        <ul className="no-bullets">
            <li><strong>Standard Trading Hours</strong></li>
            {days.map(day => (
                <li key={day}>{day}: {formatOpeningHours(day)}</li>
            ))}
        </ul>
        
        {selectedLocation.phone &&(
            <ul className="no-bullets">
                <li><strong>For more enquiries, call the pharmacy</strong></li>
                <li><a className="button button-phone" href={`tel:${formatPhoneNumber(selectedLocation.phone)}`}>Call now</a></li>
            </ul>
        )}
        {selectedLocation.bookingurl &&(
            <ul className="no-bullets">
                <li><strong>Get your appointment</strong></li>
                <li><a className="button button-calendar" href={selectedLocation.bookingurl} target="_blank" rel="noopener noreferrer">Book Now</a></li>
            </ul>
        )}
        {languages.length > 0 &&(
            <ul className="no-bullets">
                <li><strong>Languages</strong></li>
                {languages.map((language, index) => (
                <li key={index}>{language.trim()}</li>
                ))}
            </ul>
        )}
        {services.length > 0 &&(
            <ul className="no-bullets">
                <li><strong>Services:</strong></li>
                {services.map((service, index) => (
                    <li key={index}>{service.trim()}</li>
                ))}
            </ul>
        )}
    </div>
  );
};

export default PharmacyDetails;