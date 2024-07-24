import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Pharmacy = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPharmacyData(id);
    }
  }, [id]);

  const fetchPharmacyData = async (id) => {
    try {
      const response = await axios.get(`https://search.guild.org.au/s/search.json?collection=pharmacy-loc&form=json&num_ranks=1&sort=prox&query=!padnull&meta_id=${id}`);
      const data = response.data;
      if (data && data.response && data.response.resultPacket && data.response.resultPacket.results) {
        setPharmacy(data.response.resultPacket.results[0]);
        initializeMap(data.response.resultPacket.results[0]);
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    }
  };

  const initializeMap = (pharmacy) => {
    const { latitude, longitude } = pharmacy.metaData;
    const mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: map,
      title: pharmacy.title,
    });
    setMap(map);
  };

  if (!pharmacy) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{pharmacy.title}</h1>
      <p>{pharmacy.metaData.address}</p>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default Pharmacy;
