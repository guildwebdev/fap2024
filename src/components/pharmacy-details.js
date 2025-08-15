import React from 'react';
import moment from 'moment';
import he from 'he';
import getDistance from '../helpers/get-distance';
import getOpeningHours from '../helpers/get-opening-hours';
import fixURL from '../helpers/fix-url';
import fapIcon from '../imgs/member-icon.png';
import fapIconAFSA from '../imgs/afspa-icon.png';
import fapIconNonMember from '../imgs/non-member-icon.png';
import OpeningHours from './opening-hours';
import { isIOS } from 'react-device-detect';
import onSendUserAction from '../helpers/on-send-user-action';



const PharmacyDetails = ({ selectedLocation, userLocation }) => {
console.log('details location:', userLocation);

function onBookingClicked(e) {
    const safariWindow = window.open();
    onSendUserAction( selectedLocation, 'Vaccination Booking', safariWindow);
  }

    //GET DISTANCE
    const calculateDistance = () => {
        if (userLocation && 
            userLocation.latitude && 
            userLocation.longitude && 
            selectedLocation?.geometry?.coordinates) {
            const distanceInMeters = getDistance(
                { lat: userLocation.latitude, lng: userLocation.longitude },
                { lat: selectedLocation.geometry.coordinates[1], lng: selectedLocation.geometry.coordinates[0] }
            );
            const distanceInKm = (distanceInMeters / 1000).toFixed(2);
            return distanceInKm !== "0.00" ? distanceInKm : null;
        }
        return null;
    };

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
            if (selectedLocation[dayLower].open === 'Closed' || selectedLocation[dayLower].close === 'Close'){
                return 'Closed';
            }
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
        /*if (selectedLocation.holidayHours && selectedLocation.holidayHours.date) {
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
        }*/
        
        // If not a holiday, return standard opening hours
        return getOpeningHours(selectedLocation);
    };

    const currentStatus = getCurrentStatus();

    


    //HOLIDAY DATES
    const formatHolidayHours = (holidayHours) => {
        if (!holidayHours || !holidayHours.date) return [];

        console.log('holidayHours', holidayHours);

        const dates = holidayHours.date;
        const openTimes = holidayHours.open;
        const closeTimes = holidayHours.close;
        const reasons = holidayHours.reason;

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

    //RENDER HOLIDAYS
    /**/

    const handleNominateClick = () => {
        window.gpySelectedPharmacy = selectedLocation.id;
        if (typeof window.createQueryPharmacy === 'function'){
          console.log('id: ', selectedLocation.id);
          console.log('name: ', selectedLocation.name);
          window.createQueryPharmacy(selectedLocation.id, selectedLocation.name);
        }
        const gpyModal = document.getElementById('fap-gpy-landing-modal');
        if (gpyModal && window.bootstrap) {
          const modal = new window.bootstrap.Modal(gpyModal);
          modal.show();
        }
      }

      /*
      <hr className='pharmacy-single__separator'/>

                                            <div className="pharmacy-single__actions">
                                                <p className='pharmacy-single__details small'><strong>Guild Pharmacy Awards</strong></p>
                                                <button className="button-blue btn-with-backdrop btn btn-secondary" aria-label={`Nominate ${selectedLocation.name} for a Guild Pharmacy Award`} onClick={handleNominateClick}>
                                                    <div className="backdrop"><i className="fa-solid fa-star"></i>Nominate for Award</div>
                                                    <div className="overlay"><i className="fa-solid fa-star"></i>Nominate for Award</div>
                                                </button>
                                            </div>
      */

  return (
        <div>
            <section className="pharmacy-single">
                <div className="pharmacy-single__container container">
                    <div className="row">
                        <div className="col-lg-12 py-4">
                            <h2 className="pharmacy-single__title">PHARMACY</h2>
                            <div className="pharmacy-single__column">
                                <div className="fap-pharmacy__left-column">
                                    <div className="fap-pharmacy__pharmacy-icon">
                                    <img 
                                        src={
                                        selectedLocation.memberType === 'Premises'
                                        ? fapIcon
                                        : selectedLocation.memberType === 'Non-Member Ineligible AFSPA'
                                        ? fapIconAFSA
                                        : fapIconNonMember
                                        } 
                                        alt={`Find a Pharmacy Icon - ${selectedLocation.name}`}
                                    />
                                    </div>
                                    <div className="fap-pharmacy__single-pharmacy">
                                        <div className="fap-pharmacy__pharmacy-details">
                                            <h3 className='fap-pharmacy__pharmacy-name'>{selectedLocation.name}</h3>
                                            <p className='pharmacy-single__details small'><strong>Open: </strong>{currentStatus}</p>
                                            <p className='pharmacy-single__details small'><strong>Address: </strong>{streetAddress}, {cityAddress} | <OpeningHours location={selectedLocation}/></p>
                                            <p className='pharmacy-single__details small'><strong>Phone: </strong>{formatPhoneNumber(selectedLocation.phone)}</p>
                                            {selectedLocation.fax && (
                                                <p className='pharmacy-single__details small'><strong>Fax: </strong>{formatPhoneNumber(selectedLocation.fax)}</p>
                                            )}
                                            {selectedLocation.email && (
                                                <p className='pharmacy-single__details small'><strong>Email: </strong><a href={`mailto:${selectedLocation.email}`}>{selectedLocation.email}</a></p>
                                            )}
                                            {calculateDistance() && (
                                                <p className='pharmacy-single__details small'>
                                                    <strong>Distance: </strong>{calculateDistance()}km
                                                </p>
                                            )}

                                            <hr className='pharmacy-single__separator'/>                                               

                                            {formattedHolidayHours.length > 0 &&(
                                                <div>
                                                    <p className='pharmacy-single__details small'><strong>Holiday trading hours</strong>
                                                        <span className='pharmacy-single__detail-wrapper'>
                                                            {formattedHolidayHours.map((holiday, index) => (
                                                                <span className='pharmacy-single__detail-item' key={index}>
                                                                    {holiday.date} {holiday.hours} ({he.decode(holiday.reason)})
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </p>
                                                    <hr className='pharmacy-single__separator'/>
                                                </div>
                                            )}
    
                                            <p className='pharmacy-single__details small'><strong>Standard trading hours</strong>
                                                <span className='pharmacy-single__detail-wrapper'>
                                                    {days.map(day => (
                                                        <span className='pharmacy-single__detail-item' key={day}>{day}: {formatOpeningHours(day)}</span>
                                                    ))}
                                                </span>
                                            </p>

                                            

                                            <hr className='pharmacy-single__separator'/>
            
                                            <div className="pharmacy-single__actions">
                                                {selectedLocation.bookingurl &&(
                                                    <div>
                                                        <p className='pharmacy-single__details small'><strong>Get your appointment</strong></p>
                                                        {isIOS ? (
                                                            <button className="button-yellow btn-with-backdrop btn btn-secondary"  aria-label={`Book an appointment with ${selectedLocation.name}`} onClick={() => window.open(selectedLocation.bookingurl, '_blank')}>
                                                                <div className="backdrop"><i className="fa-solid fa-calendar-days"></i>Book Now</div>
                                                                <div className="overlay"><i className="fa-solid fa-calendar-days"></i>Book Now</div>
                                                            </button>
                                                        ) : (
                                                            <button className="button-yellow btn-with-backdrop btn btn-secondary"  aria-label={`Book an appointment with ${selectedLocation.name}`} onClick={onBookingClicked}>
                                                                <div className="backdrop"><i className="fa-solid fa-calendar-days"></i>Book Now</div>
                                                                <div className="overlay"><i className="fa-solid fa-calendar-days"></i>Book Now</div>
                                                            </button>
                                                        )}
                                                        <hr className='pharmacy-single__separator'/>
                                                    </div>
                                                )}

                                                {selectedLocation.phone &&( 
                                                    <div>                                           
                                                        <p className="pharmacy-single__details small"><strong>For more enquiries, call the pharmacy</strong></p>
                                                        <button className="pharmacy-single__call-now button-blue btn-with-backdrop btn btn-secondary"  aria-label={`Call now - ${selectedLocation.name}`} onClick={() => window.open(`tel:${formatPhoneNumber(selectedLocation.phone)}`)}>
                                                            <div className="backdrop">Call now <i className='fa-solid fa-phone-flip'></i></div>
                                                            <div className="overlay">Call now <i className='fa-solid fa-phone-flip'></i></div>
                                                        </button>
                                                        <hr className='pharmacy-single__separator'/>
                                                    </div>
                                                )}
                                            </div>

                                            <div className='fap-pharmacy__specialities'>
                                                {selectedLocation.facebook && (
                                                    <a 
                                                        href={fixURL(selectedLocation.facebook)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                                                        className="noexternal"
                                                    >
                                                        <i className="fa-brands fa-facebook"></i>
                                                    </a>
                                                )}
                                                {selectedLocation.instagram && (
                                                    <a 
                                                        href={fixURL(selectedLocation.instagram)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                                                        className="noexternal"
                                                    >
                                                        <i className="fa-brands fa-instagram"></i>
                                                    </a>
                                                )}
                                                {selectedLocation.twitter && (
                                                    <a 
                                                        href={fixURL(selectedLocation.twitter)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                                                        className="noexternal"
                                                    >
                                                        <i className="fa-brands fa-x-twitter"></i>
                                                    </a>
                                                )}
                                                {selectedLocation.website && (
                                                    <a 
                                                        href={fixURL(selectedLocation.website)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}
                                                        className="noexternal"
                                                    >
                                                        <i className="fa-solid fa-globe"></i>
                                                    </a>
                                                )}
                                            </div> 

                                            {languages.length > 0 &&(
                                                <div>
                                                    <hr className='pharmacy-single__separator'/>
                                                    <p className="pharmacy-single__details small"><strong>Languages spoken</strong>
                                                        <span className='pharmacy-single__detail-wrapper'>
                                                            {languages.map((language, index) => (
                                                                <span className="pharmacy-single__detail-item" key={index}>{language.trim()}</span>
                                                            ))}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}                                           
                                        </div>
                                    </div>
                                </div>
                                <div className="fap-pharmacy__right-column">
                                    <div className='fap-pharmacy__single-pharmacy'>
                                        <div className="fap-pharmacy__pharmacy-details">
                                            {services.length > 0 &&(
                                                <p className="pharmacy-single__details small"><strong>Services:</strong>
                                                    <span className='pharmacy-single__detail-wrapper'>
                                                        {services.map((service, index) => (
                                                            <span className="pharmacy-single__detail-item" key={index}>{service.trim()}</span>
                                                        ))}
                                                    </span>
                                                </p>
                                            )}

                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>       
    );
};

export default PharmacyDetails;