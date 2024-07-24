import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapContainer from '../components/map-container';
import '../index.css'; // Ensure the CSS file is imported

const Pharmacy = () => {
  const [pharmacy, setPharmacy] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pharmacyId = queryParams.get('pharmacyId');
    if (pharmacyId) {
      fetchPharmacyData(pharmacyId);
    }
  }, []);

  const fetchPharmacyData = async (id) => {
    try {
      const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=1&sort=prox&query=!padnull&meta_id=${id}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        setPharmacy(data.response.resultPacket.results[0]);
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    }
  };

  if (!pharmacy) {
    return <div>Loading...</div>;
  }

  const { latitude, longitude } = pharmacy.metaData;

  return (
    <div>
      <h1>{pharmacy.title}</h1>
      <p>{pharmacy.metaData.address}</p>
      <div className="c-map-container--services" style={{ height: '500px', width: '100%' }}>
        <MapContainer
          mapCenter={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
          zoom={15}
          locations={[{
            id: pharmacy.metaData.id,
            name: pharmacy.title,
            geometry: {
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
          }]}
          selectedLocation={{
            id: pharmacy.metaData.id,
            name: pharmacy.title,
            geometry: {
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
          }}
          handleDataReceived={() => {}}
          handleSelectLocation={() => {}}
          handleCenterChange={() => {}}
        />
      </div>
    </div>
  );
};

export default Pharmacy;