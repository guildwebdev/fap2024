import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimpleMapContainer from '../components/simple-map-container';
import '../index.css'; // Ensure the CSS file is imported
import PharmacyDetails from "../components/pharmacy-details";

const Pharmacy = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pharmacyId = queryParams.get('pharmacyId');
    if (pharmacyId) {
      fetchPharmacyData(pharmacyId);
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }, 
        (error) => {
          console.log('error getting user location: ', error);
        }
      );
    } else {
      console.log('Geolocation not available in this browser');
    }

  }, []);

  const fetchPharmacyData = async (id) => {
    try {
      const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=1&sort=prox&query=!padnull&meta_id=${id}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        setPharmacy(data.response.resultPacket.results[0]);
        console.log('Pharmacy data:',data.response.resultPacket.results[0]);
      } else {
        console.error('Pharmacy data not found or in unexpected format');
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    }
  };

  if (!pharmacy || !userLocation) {
    return <div>Loading...</div>;
  }

  const { latitude, longitude } = pharmacy.metaData;

  const locations = [{
    id: pharmacy.metaData.id,
    name: pharmacy.title,
    geometry: {
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    address: pharmacy.metaData.address,
    address2: pharmacy.metaData.address2,
    address3: pharmacy.metaData.address3,
    city: pharmacy.metaData.city,
    state: pharmacy.metaData.state,
    postcode: pharmacy.metaData.postcode,
    phone: pharmacy.metaData.phone,
    fax: pharmacy.metaData.fax,
    email: pharmacy.metaData.email,
    services: pharmacy.metaData.services,
    language: pharmacy.metaData.language,
    website: pharmacy.metaData.website,
    facebook: pharmacy.metaData.facebook,
    twitter: pharmacy.metaData.twitter,
    instagram: pharmacy.metaData.instagram,
    bookingurl: pharmacy.metaData.bookingurl,
    gcvpBookingURL: pharmacy.metaData.gcvpBookingURL,
    memberType: pharmacy.metaData.membershipType,
    extendedHours: pharmacy.metaData.extendedHours,
    weekends: pharmacy.metaData.weekends,
    kmFromOrigin: pharmacy.kmFromOrigin
  }];

  const selectedLocation = {
    id: pharmacy.metaData.id,
    name: pharmacy.title,
    geometry: {
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    address: pharmacy.metaData.address,
    address2: pharmacy.metaData.address2,
    address3: pharmacy.metaData.address3,
    city: pharmacy.metaData.city,
    state: pharmacy.metaData.state,
    postcode: pharmacy.metaData.postcode,
    phone: pharmacy.metaData.phone,
    fax: pharmacy.metaData.fax,
    email: pharmacy.metaData.email,
    services: pharmacy.metaData.services,
    language: pharmacy.metaData.language,
    website: pharmacy.metaData.website,
    facebook: pharmacy.metaData.facebook,
    twitter: pharmacy.metaData.twitter,
    instagram: pharmacy.metaData.instagram,
    bookingurl: pharmacy.metaData.bookingurl,
    gcvpBookingURL: pharmacy.metaData.gcvpBookingURL,
    memberType: pharmacy.metaData.membershipType,
    extendedHours: pharmacy.metaData.extendedHours,
    weekends: pharmacy.metaData.weekends,
    kmFromOrigin: pharmacy.kmFromOrigin,
    active: true,
    monday: {
      open: pharmacy.metaData.mondayOpening,
      close: pharmacy.metaData.mondayClosing
    },
    tuesday: {
      open: pharmacy.metaData.tuesdayOpening,
      close: pharmacy.metaData.tuesdayClosing
    },
    wednesday: {
      open: pharmacy.metaData.wednesdayOpening,
      close: pharmacy.metaData.wednesdayClosing
    },
    thursday: {
      open: pharmacy.metaData.thursdayOpening,
      close: pharmacy.metaData.thursdayClosing
    },
    friday: {
      open: pharmacy.metaData.fridayOpening,
      close: pharmacy.metaData.fridayClosing
    },
    saturday: {
      open: pharmacy.metaData.saturdayOpening,
      close: pharmacy.metaData.saturdayClosing
    },
    sunday: {
      open: pharmacy.metaData.sundayOpening,
      close: pharmacy.metaData.sundayClosing
    },
    holidayHours: {
      date: pharmacy.metaData.PTHEDate,
      open: pharmacy.metaData.PTHEOpenLabel,
      close: pharmacy.metaData.PTHECloseLabel,
      reason: pharmacy.metaData.PTHEReason
    }
  };

  return (
    <div>
      <h1>{pharmacy.title}</h1>
      <div className="c-map-container--services" style={{ height: '500px', width: '100%' }}>
        <SimpleMapContainer
          mapCenter={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
          zoom={15}
          locations={locations}
          selectedLocation={selectedLocation}
          handleDataReceived={() => {}}
          handleSelectLocation={() => {}}
          handleCenterChange={() => {}}
        />
      </div>
      <div className="c-map-details--services">
        <PharmacyDetails
          selectedLocation={selectedLocation}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
};

export default Pharmacy;