import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimpleMapContainer from '../components/simple-map-container';
import '../index.css'; // Ensure the CSS file is imported
import PharmacyDetails from "../components/pharmacy-details";
import NearbyPharmacies from '../components/nearby-pharmacies';

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
      id: result.listMetadata.id,
      geometry: {
        coordinates: [parseFloat(result.listMetadata.latitude), parseFloat(result.listMetadata.longitude)]
      },
      address: result.listMetadata.address,
      address2: result.listMetadata.address2,
      address3: result.listMetadata.address3,
      city: result.listMetadata.city,
      state: result.listMetadata.state,
      postcode: result.listMetadata.postcode,
      phone: result.listMetadata.phone,
      bookingurl: result.listMetadata.bookingurl,
      monday: {
        open: result.listMetadata.mondayOpening,
        close: result.listMetadata.mondayClosing
      },
      tuesday: {
        open: result.listMetadata.tuesdayOpening,
        close: result.listMetadata.tuesdayClosing
      },
      wednesday: {
        open: result.listMetadata.wednesdayOpening,
        close: result.listMetadata.wednesdayClosing
      },
      thursday: {
        open: result.listMetadata.thursdayOpening,
        close: result.listMetadata.thursdayClosing
      },
      friday: {
        open: result.listMetadata.fridayOpening,
        close: result.listMetadata.fridayClosing
      },
      saturday: {
        open: result.listMetadata.saturdayOpening,
        close: result.listMetadata.saturdayClosing
      },
      sunday: {
        open: result.listMetadata.sundayOpening,
        close: result.listMetadata.sundayClosing
      },
      holidayHours: {
        date: result.listMetadata.PTHEDate,
        open: result.listMetadata.PTHEOpenLabel,
        close: result.listMetadata.PTHECloseLabel,
        reason: result.listMetadata.PTHEReason
      }
    }));
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pharmacyId = queryParams.get('pharmacyId');
    const originLoc = queryParams.get('origin');
    
    if (pharmacyId) {
      fetchPharmacyData(pharmacyId);
    }

    if (originLoc){
      const [originLat, originLong] = originLoc.split(',');
      setOrigin(originLoc);
      fetchNearbyPharmacies(originLoc);
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log('MY LOCATION:',position.coords);
        }, 
        (error) => {
          console.log('error getting user location: ', error);
        }
      );
    } else {
      console.log('Geolocation not available in this browser');
    }

  }, []);

  const fetchNearbyPharmacies = async (loc) => {
    try {
      const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=3&sort=prox&start_rank=2&query=!padnull&origin=${loc}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        const cleanData = nearbyPharmacies(data.response.resultPacket.results);
        setNearby(cleanData);
        //console.log('Nearby data:', data.response.resultPacket.results);
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
        setPharmacy(data.response.resultPacket.results[0]);
        //console.log('Pharmacy data:',data.response.resultPacket.results[0]);
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


  /*
  <h1>{pharmacy.title}</h1>
  
  */
  
  return (
    <div>

        <div className="c-map-container fap-map" style={{ height: '550px', width: '100%' }}>
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

        
 
      
      <section className="latest-updates">
        <div className="latest-updates__container container-fluid">
          <div className="row">
            <div className="latest-updates__column-wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="latest-updates_title-wrapper">
                      <h2 className="title-with-pretitle">Your Other Nearest Pharmacies</h2>
                    </div>
                  </div>
                  <NearbyPharmacies
                    locations={nearbyLocations}
                    origin={origin}
                  />
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