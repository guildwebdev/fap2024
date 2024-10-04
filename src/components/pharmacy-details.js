import React from 'react';

const PharmacyDetails = ({ selectedLocation }) => {
  return (
    <div>
        <h4>{selectedLocation.name}</h4>
        <ul className="no-bullets">
            <li><strong>Open: </strong>INSERT HERE</li>
            <li><strong>Address: </strong>{selectedLocation.address} - FORMAT</li>
            <li><strong>Phone: </strong>{selectedLocation.phone} - FORMAT</li>
            <li><strong>Fax: </strong>{selectedLocation.fax} - FORMAT</li>
            <li><strong>Email: </strong>{selectedLocation.email} - ADD LINK</li>
            <li><strong>Distance: </strong>{selectedLocation.kmFromOrigin} - MAKE RELATIVE TO USER</li>
        </ul>
        <ul className="no-bullets">
            <li><strong>Holiday Trading Hours</strong></li>
            <li>INSERT HERE</li>
        </ul>
        <ul className="no-bullets">
            <li><strong>Standard Trading Hours</strong></li>
            <li>Monday: INSERT</li>
            <li>Tuesday: INSERT</li>
            <li>Wednesday: INSERT</li>
            <li>Thursday: INSERT</li>
            <li>Friday: INSERT</li>
            <li>Saturday: INSERT</li>
            <li>Sunday: INSERT</li>
        </ul>
        <ul class="no-bullets">
            <li><strong>For more enquiries, call the pharmacy</strong></li>
            <li><a className="button button-phone" href={`tel:${selectedLocation.phone}`}>Call now</a></li>
        </ul>
        <ul class="no-bullets">
            <li><strong>Get your appointment</strong></li>
            <li><a className="button button-calendar" href={selectedLocation.bookingurl}>Book Now</a></li>
        </ul>
    </div>
  );
};

export default PharmacyDetails;