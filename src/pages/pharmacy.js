import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimpleMapContainer from '../components/simple-map-container';
import '../index.css'; // Ensure the CSS file is imported
import PharmacyDetails from "../components/pharmacy-details";
import NearbyPharmacies from '../components/nearby-pharmacies';
import fapIcon from '../imgs/find-a-pharmacy-icon.png';
import _ from 'lodash';

const Pharmacy = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLocations, setNearby] = useState(null);
  const [origin, setOrigin] = useState(null);

  const handleLocationSuccess = (position) => {
    setUserLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    console.log('MY LOCATION:', position.coords);
  };

  const nearbyPharmacies = (results) => {
    return results.map(result => ({
      name: result.title,
      id: (result.listMetadata.id ?? []).join(','),
      geometry: {
        coordinates: [parseFloat(result.listMetadata.latitude), parseFloat(result.listMetadata.longitude)]
      },
      address: (result.listMetadata.address ?? []).join(','),
      address2: (result.listMetadata.address2 ?? []).join(','),
      address3: (result.listMetadata.address3 ?? []).join(','),
      city: (result.listMetadata.city ?? []).join(','),
      state: (result.listMetadata.state ?? []).join(','),
      postcode: (result.listMetadata.postcode ?? []).join(','),
      phone: (result.listMetadata.phone ?? []).join(','),
      bookingurl: (result.listMetadata.bookingurl ?? []).join(','),
      monday: {
        open: (result.listMetadata.mondayOpening ?? []).join(','),
        close: (result.listMetadata.mondayClosing ?? []).join(',')
      },
      tuesday: {
        open: (result.listMetadata.tuesdayOpening ?? []).join(','),
        close: (result.listMetadata.tuesdayClosing ?? []).join(',')
      },
      wednesday: {
        open: (result.listMetadata.wednesdayOpening ?? []).join(','),
        close: (result.listMetadata.wednesdayClosing ?? []).join(',')
      },
      thursday: {
        open: (result.listMetadata.thursdayOpening ?? []).join(','),
        close: (result.listMetadata.thursdayClosing ?? []).join(',')
      },
      friday: {
        open: (result.listMetadata.fridayOpening ?? []).join(','),
        close: (result.listMetadata.fridayClosing ?? []).join(',')
      },
      saturday: {
        open: (result.listMetadata.saturdayOpening ?? []).join(','),
        close: (result.listMetadata.saturdayClosing ?? []).join(',')
      },
      sunday: {
        open: (result.listMetadata.sundayOpening ?? []).join(','),
        close: (result.listMetadata.sundayClosing ?? []).join(',')
      },
      holidayHours: {
        date: result.listMetadata.PTHEDate,
        open: result.listMetadata.PTHEOpenLabel,
        close: result.listMetadata.PTHECloseLabel,
        reason: result.listMetadata.PTHEReason
      }
    }));
  };

  const setLocationFromQueryString = (originLoc) => {
    if (originLoc) {
      console.log('Location passed as query string', originLoc);
      const [originLat, originLong] = originLoc.split(',');
      setUserLocation({
        latitude: originLat,
        longitude: originLong
      });
      return true; // Indicates location was set
    }
    return false; // Indicates location was not set
  };

  const setLocationFromPharmacy = async (pharmacyId) => {
    if (pharmacyId) {
      const fetchedPharmacy = await fetchPharmacyData(pharmacyId); // Adjust fetch to return data if needed
      if (fetchedPharmacy) {
        setUserLocation({
          latitude: fetchedPharmacy.listMetadata.latitude, // Ensure proper indexing
          longitude: fetchedPharmacy.listMetadata.longitude
        });
        return true; // Indicates location was set
      } else {
        console.log('no pharmacy');
      }
    }
    return false; // Indicates location was not set
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pharmacyId = queryParams.get('pharmacyId');
    const originLoc = queryParams.get('origin');

    const handleGeolocation = (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      console.log('FOUND MY LOCATION:', position.coords);
      
      if (pharmacyId) {
        fetchNearbyPharmacies({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }, pharmacyId);
      }
    };

    const handleError = async (error) => {
      console.log('Error getting user location:', error);
      console.log('Geolocation not available in this browser');

      // Try to set location from query string
      if (!setLocationFromQueryString(originLoc)) {
        // If not set from query string, fallback to pharmacy data
        await setLocationFromPharmacy(pharmacyId);
      } else {
        if (pharmacyId) {
          fetchNearbyPharmacies(userLocation, pharmacyId);
        }
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(handleGeolocation, handleError);
    } else {
      console.log('Geolocation not available in this browser');
      if (!setLocationFromQueryString(originLoc)) {
        setLocationFromPharmacy(pharmacyId);
      } else {
        if (pharmacyId) {
          fetchNearbyPharmacies(userLocation, pharmacyId);
        }
      }
    }
  }, []);

  useEffect(() => {
    console.log('Found userLocation:', userLocation);
    const queryParams = new URLSearchParams(window.location.search);
    const pharmacyId = queryParams.get('pharmacyId');

    if (pharmacyId && userLocation) {
      console.log('going to fetch');
      fetchPharmacyData(pharmacyId).then((data) => {
        if (data) {
          fetchNearbyPharmacies(userLocation, pharmacyId);
        }
      });
    }
  }, [userLocation]);

  const fetchNearbyPharmacies = async (loc,id) => {
    console.log('about to fetch from origin:',loc,id);
    if (typeof loc === 'object' && loc !== null){
      loc = `${loc.latitude},${loc.longitude}`;
    } 
    console.log('new fetch as origin:', loc, id);
    try {
      const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=3&sort=prox&start_rank=1&meta_id=!${id}&query=!padnull&origin=${loc}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        const cleanData = nearbyPharmacies(data.response.resultPacket.results);
        setNearby(cleanData);
        console.log('Nearby data:', cleanData);
      } else {
        console.error('Nearby data not found or in unexpected format');
      }
    } catch (error){
      console.error('Error fetching nearby data:', error);
    }
  };

  const fetchPharmacyData = async (id) => {
    try {
      const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=1&sort=prox&query=!padnull&meta_id=${id}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        const pharmacyData = data.response.resultPacket.results[0]
        setPharmacy(pharmacyData);
        console.log('pharmacy set:',data.response.resultPacket.results[0]);
        //console.log('Pharmacy data:',data.response.resultPacket.results[0]);
        return pharmacyData;
      } else {
        console.error('Pharmacy data not found or in unexpected format');
        return null;
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
      return null;
    }
  };

  // Loading state check
  if (!userLocation) {
    return <div>Loading...</div>;
  }

  if (!pharmacy) {
    return <div>Loading pharmacy data...</div>;
  }

  const { latitude, longitude } = pharmacy.listMetaData;

  const locations = [{
    id: (pharmacy.listMetadata.id ?? []).join(','),
    name: pharmacy.title,
    geometry: {
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    address: (pharmacy.listMetadata.address ?? []).join(','),
    address2: (pharmacy.listMetadata.address2 ?? []).join(','),
    address3: (pharmacy.listMetadata.address3 ?? []).join(','),
    city: (pharmacy.listMetadata.city ?? []).join(','),
    state: (pharmacy.listMetadata.state ?? []).join(','),
    postcode: (pharmacy.listMetadata.postcode ?? []).join(','),
    phone: (pharmacy.listMetadata.phone ?? []).join(','),
    fax: (pharmacy.listMetadata.fax ?? []).join(','),
    email: (pharmacy.listMetadata.email ?? []).join(','),
    services: (pharmacy.listMetadata.services ?? []).join('|'),
    language: (pharmacy.listMetadata.language ?? []).join('|'),
    website: (pharmacy.listMetadata.website ?? []).join(','),
    facebook: (pharmacy.listMetadata.facebook ?? []).join(','),
    twitter: (pharmacy.listMetadata.twitter ?? []).join(','),
    instagram: (pharmacy.listMetadata.instagram ?? []).join(','),
    bookingurl: (pharmacy.listMetadata.bookingurl ?? []).join(','),
    gcvpBookingURL: (pharmacy.listMetadata.gcvpBookingURL ?? []).join(','),
    memberType: (pharmacy.listMetadata.membershipType ?? []).join(','),
    extendedHours: (pharmacy.listMetadata.extendedHours ?? []).join(','),
    weekends: (pharmacy.listMetadata.weekends ?? []).join(','),
    kmFromOrigin: pharmacy.kmFromOrigin
  }];

  const selectedLocation = {
    id: (pharmacy.listMetadata.id ?? []).join(','),
    name: pharmacy.title,
    geometry: {
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    address: (pharmacy.listMetadata.address ?? []).join(','),
    address2: (pharmacy.listMetadata.address2 ?? []).join(','),
    address3: (pharmacy.listMetadata.address3 ?? []).join(','),
    city: (pharmacy.listMetadata.city ?? []).join(','),
    state: (pharmacy.listMetadata.state ?? []).join(','),
    postcode: (pharmacy.listMetadata.postcode ?? []).join(','),
    phone: (pharmacy.listMetadata.phone ?? []).join(','),
    fax: (pharmacy.listMetadata.fax ?? []).join(','),
    email: (pharmacy.listMetadata.email ?? []).join(','),
    services: (pharmacy.listMetadata.services ?? []).join('|'),
    language: (pharmacy.listMetadata.language ?? []).join('|'),
    website: (pharmacy.listMetadata.website ?? []).join(','),
    facebook: (pharmacy.listMetadata.facebook ?? []).join(','),
    twitter: (pharmacy.listMetadata.twitter ?? []).join(','),
    instagram: (pharmacy.listMetadata.instagram ?? []).join(','),
    bookingurl: (pharmacy.listMetadata.bookingurl ?? []).join(','),
    gcvpBookingURL: (pharmacy.listMetadata.gcvpBookingURL ?? []).join(','),
    memberType: (pharmacy.listMetadata.membershipType ?? []).join(','),
    extendedHours: (pharmacy.listMetadata.extendedHours ?? []).join(','),
    weekends: (pharmacy.listMetadata.weekends ?? []).join(','),
    kmFromOrigin: pharmacy.kmFromOrigin,
    active: true,
    monday: {
      open: (pharmacy.listMetadata.mondayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.mondayClosing ?? []).join(',')
    },
    tuesday: {
      open: (pharmacy.listMetadata.tuesdayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.tuesdayClosing ?? []).join(',')
    },
    wednesday: {
      open: (pharmacy.listMetadata.wednesdayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.wednesdayClosing ?? []).join(',')
    },
    thursday: {
      open: (pharmacy.listMetadata.thursdayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.thursdayClosing ?? []).join(',')
    },
    friday: {
      open: (pharmacy.listMetadata.fridayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.fridayClosing ?? []).join(',')
    },
    saturday: {
      open: (pharmacy.listMetadata.saturdayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.saturdayClosing ?? []).join(',')
    },
    sunday: {
      open: (pharmacy.listMetadata.sundayOpening ?? []).join(','),
      close: (pharmacy.listMetadata.sundayClosing ?? []).join(',')
    },
    holidayHours: {
      date: pharmacy.listMetadata.PTHEDate,
      open: pharmacy.listMetadata.PTHEOpenLabel,
      close: pharmacy.listMetadata.PTHECloseLabel,
      reason: pharmacy.listMetadata.PTHEReason
    }
  };

  return (
    <div>
      <section className="pharmacy-location">
        <div className='pharmacy-location__container container'>
          <div className='row'>
            <div className='pharmacy-location__column col-lg-12'>
              <div className='pharmacy-location__name-wrapper'>
                <img src={fapIcon} className="pharmacy-location__icon" alt={`Icon for ${pharmacy.title}`}/>
                <h1 className="pharmacy-location__name">{pharmacy.title}</h1>
              </div>
              <div className="c-map-container fap-map" style={{ height: '600px', width: '100%' }}>
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
            </div>
          </div>
        </div>
      </section>

      <section className="breadcrumbs breadcrumbs-only-nav">
        <div className="breadcrumbs-nav">
          <div className="breadcrumbs-nav__container container">
            <div className="row">
              <div className="breadcrumbs-nav__wrapper col-lg-12">
                <a href="/" className="breadcrumbs-nav__parents"><i className="fa-solid fa-house-medical"></i></a>                        
                <span className="seperator">/</span>              
                <a href="#" className="breadcrumbs-nav__current-page">Pharmacy - {pharmacy.title}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PharmacyDetails
        selectedLocation={selectedLocation}
        userLocation={userLocation}
      />

      <section className="nearest-pharmacy">
        <div className="nearest-pharmacy__container container-fluid">
          <div className="row">
            <div className="nearest-pharmacy__column col-lg-12 py-4">
              <div className="nearest-pharmacy__column-wrapper">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <h2 className="nearest-pharmacy__column-title">Your Nearest Pharmacies</h2>
                      <NearbyPharmacies
                        locations={nearbyLocations}
                        origin={userLocation}
                      />
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

export default Pharmacy;