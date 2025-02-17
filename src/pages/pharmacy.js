import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimpleMapContainer from '../components/simple-map-container';
import '../index.css'; // Ensure the CSS file is imported
import PharmacyDetails from "../components/pharmacy-details";
import NearbyPharmacies from '../components/nearby-pharmacies';
import fapIcon from '../imgs/member-icon.png';
import fapIconAFSA from '../imgs/afspa-icon.png';
import fapIconNonMember from '../imgs/non-member-icon.png';
import _ from 'lodash';
import loadingIcon from '../imgs/fap-loading.svg';
import MapWithSearch from './map-with-search';
import Search from './search';
import MapBasic from './map-basic';
import MapContainer from '../components/map-container';
import { Helmet } from 'react-helmet';
import { select } from 'react-cookies';

const sendGTMEvent = (pharmacyName) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      'event': 'pharmacyView',
      'pharmacy': pharmacyName
    });
  }
};

const Pharmacy = ({pharmacyLocation}) => {
  const [pharmacy, setPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLocations, setNearby] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  var pharmacyAddress, pharmacyName, pharmacyStreetAddress = "";

  const handleLocationSuccess = (position) => {
    setUserLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    console.log('MY LOCATION:', position.coords);
  };

  const nearbyPharmacies = (results) => {
    return results.map(result => ({

      
      name: (result.listMetadata.name ?? []).join(','),
      id: (result.listMetadata.id ?? []).join(','),
      geometry: {
        coordinates: [parseFloat(result.listMetadata.x[0].split(';')[0]), parseFloat(result.listMetadata.x[0].split(';')[1])]
      },
      address: (result.listMetadata.address ?? []).join(','),
      address2: (result.listMetadata.address2 ?? []).join(','),
      address3: (result.listMetadata.address3 ?? []).join(','),
      city: (result.listMetadata.city ?? []).join(','),
      state: (result.listMetadata.state ?? []).join(','),
      postcode: (result.listMetadata.postcode ?? []).join(','),
      phone: (result.listMetadata.phone ?? []).join(','),
      memberType: (result.listMetadata.memberType ?? []).join(','),
      bookingurl: (result.listMetadata.bookingurl ?? []).join(','),
      monday: {
        open: (result.listMetadata.mondayOpen ?? []).join(','),
        close: (result.listMetadata.mondayClose ?? []).join(',')
      },
      tuesday: {
        open: (result.listMetadata.tuesdayOpen ?? []).join(','),
        close: (result.listMetadata.tuesdayClose ?? []).join(',')
      },
      wednesday: {
        open: (result.listMetadata.wednesdayOpen ?? []).join(','),
        close: (result.listMetadata.wednesdayClose ?? []).join(',')
      },
      thursday: {
        open: (result.listMetadata.thursdayOpen ?? []).join(','),
        close: (result.listMetadata.thursdayClose ?? []).join(',')
      },
      friday: {
        open: (result.listMetadata.fridayOpen ?? []).join(','),
        close: (result.listMetadata.fridayClose ?? []).join(',')
      },
      saturday: {
        open: (result.listMetadata.saturdayOpen ?? []).join(','),
        close: (result.listMetadata.saturdayClose ?? []).join(',')
      },
      sunday: {
        open: (result.listMetadata.sundayOpene ?? []).join(','),
        close: (result.listMetadata.sundayClose ?? []).join(',')
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
      //const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=3&sort=prox&start_rank=1&meta_id=!${id}&query=!padnull&origin=${loc}`);
      const response = await axios.get(`https://dxp-au-search.funnelback.squiz.cloud/s/search.json?collection=tpgoa~sp-locations&profile=react-data&num_ranks=3&sort=prox&start_rank=1&meta_id=!${id}&query=!padnull&origin=${loc}`);
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
      //const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=1&sort=prox&query=!padnull&meta_id=${id}`);
      const response = await axios.get(`https://dxp-au-search.funnelback.squiz.cloud/s/search.json?collection=tpgoa~sp-locations&profile=react-data&num_ranks=1&sort=prox&query=!padnull&meta_id=${id}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        const pharmacyData = data.response.resultPacket.results[0];

        if (pharmacyData.title) {
          sendGTMEvent(pharmacyData.title);
        }

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
    //return <div>Loading... no userLocation</div>;
    console.log('no user location');
  }

  if (!pharmacy) {
    return (
      <div className="fap-map">
        <Search
          handleInput={() => {}}
          defaultLocation = ""
        />   
      </div>
    );
  }

  //const { latitude, longitude } = pharmacy.listMetaData;
  //const latitude = pharmacy.listMetadata.latitude ?? [].join(',');
  //const longitude = pharmacy.listMetadata.longitude ?? [].join(',');

  const [latitude = '', longitude = ''] = (pharmacy.listMetadata.x[0] || '').split(';');


  const locations = [{
    id: (pharmacy.listMetadata.id ?? []).join(','),
    name: (pharmacy.listMetadata.name ?? []).join(','),
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
    memberType: (pharmacy.listMetadata.memberType ?? []).join(','),
    extendedHours: (pharmacy.listMetadata.extendedHours ?? []).join(','),
    weekends: (pharmacy.listMetadata.weekends ?? []).join(','),
    kmFromOrigin: pharmacy.kmFromOrigin
  }];

  const selectedLocation = {
    id: (pharmacy.listMetadata.id ?? []).join(','),
    name: (pharmacy.listMetadata.name ?? []).join(','),
    geometry: {
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    address: (pharmacy.listMetadata.address ?? []).join(','),
    address2: (pharmacy.listMetadata.address2 ?? []).join(','),
    address3: (pharmacy.listMetadata.address3 ?? []).join(','),
    streetAddress: [
      pharmacy.listMetadata.address,
      pharmacy.listMetadata.address2,
      pharmacy.listMetadata.address3
    ].filter(Boolean).join(', '),
    fulladdress: [
      pharmacy.listMetadata.address,
      pharmacy.listMetadata.address2,
      pharmacy.listMetadata.address3,
      pharmacy.listMetadata.city,
      pharmacy.listMetadata.state,
      pharmacy.listMetadata.postcode
    ].filter(Boolean).join(', '),
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
    memberType: (pharmacy.listMetadata.memberType ?? []).join(','),
    extendedHours: (pharmacy.listMetadata.extendedHours ?? []).join(','),
    weekends: (pharmacy.listMetadata.weekends ?? []).join(','),
    kmFromOrigin: pharmacy.kmFromOrigin,
    active: true,
    monday: {
      open: (pharmacy.listMetadata.mondayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.mondayClose ?? []).join(',')
    },
    tuesday: {
      open: (pharmacy.listMetadata.tuesdayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.tuesdayClose ?? []).join(',')
    },
    wednesday: {
      open: (pharmacy.listMetadata.wednesdayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.wednesdayClose ?? []).join(',')
    },
    thursday: {
      open: (pharmacy.listMetadata.thursdayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.thursdayClose ?? []).join(',')
    },
    friday: {
      open: (pharmacy.listMetadata.fridayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.fridayClose ?? []).join(',')
    },
    saturday: {
      open: (pharmacy.listMetadata.saturdayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.saturdayClose ?? []).join(',')
    },
    sunday: {
      open: (pharmacy.listMetadata.sundayOpen ?? []).join(','),
      close: (pharmacy.listMetadata.sundayClose ?? []).join(',')
    },
    holidayHours: {
      date: pharmacy.listMetadata.PTHEDate,
      open: pharmacy.listMetadata.PTHEOpenLabel,
      close: pharmacy.listMetadata.PTHECloseLabel,
      reason: pharmacy.listMetadata.PTHEReason
    }
  };

  console.log('coords:',selectedLocation.latitude);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": selectedLocation.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": selectedLocation.streetAddress,
      "addressLocality": selectedLocation.city,
      "addressRegion": selectedLocation.state,
      "postalCode": selectedLocation.postcode,
      "addressCountry": "AU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": selectedLocation.geometry.coordinates[1],
      "longitude": selectedLocation.geometry.coordinates[0]
    },
    "telephone": selectedLocation.phone,
    "image": "https://findapharmacy.com.au/__data/assets/image/0029/148286/find-a-pharmacy-icon.png",
    "url": `https://findapharmacy.com.au/pharmacy?pharmacyId=${selectedLocation.id}`
  };

  return (
    <>
      <Helmet>
          <title>{`${selectedLocation.name} - Find a Pharmacy`}</title>
          <meta name="description" content={`Visit ${selectedLocation.name} located at ${selectedLocation.fulladdress}. Services include ${selectedLocation.services.replace(/\|/g,', ')}`} />
          <meta property="og:title" content={`${selectedLocation.name} - Find a Pharmacy`} />
          <meta property="og:description" content={`Visit ${selectedLocation.name} located at ${selectedLocation.fulladdress}`} />
          <meta property="og:type" content="business.business" />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
          <meta property="test" content="something"/>
      </Helmet>
      
      <section className="pharmacy-location">
        <div className='pharmacy-location__container container'>
          <div className='row'>
            <div className='pharmacy-location__column col-lg-12'>
              <div className='pharmacy-location__name-wrapper'>
              <img 
                src={
                  pharmacy.listMetadata.memberType[0] === 'Premises'
                  ? fapIcon
                  : pharmacy.listMetadata.memberType[0] === 'Non-Member Ineligible AFSPA'
                  ? fapIconAFSA
                  : fapIconNonMember
                } 
                alt={`Find a Pharmacy Icon - ${pharmacy.name}`}
                className="pharmacy-location__icon"
              />
                <h1 className="pharmacy-location__name">{selectedLocation.name}</h1>
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
                <a href="#" className="breadcrumbs-nav__current-page">Pharmacy - {selectedLocation.name}</a>
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
                      <h2 className="nearest-pharmacy__column-title">Your nearest pharmacies</h2>
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
    </>
  );
};

export default Pharmacy;