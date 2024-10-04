import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import getOpeningHours from '../helpers/get-opening-hours';

class SimpleMapMarker extends Component {
  constructor(props) {
    super(props);
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(e) {
    e.preventDefault();
    this.props.handleSelectLocation(this.props.location, false, this.willCenterToMarker(e.target));
  }

  willCenterToMarker(marker) {
    const parent = marker.parentNode.parentNode;
    const relativeOffsetLeft = marker.getBoundingClientRect().left - window.scrollX;
    const isMobile = window.innerWidth < 600;
    const cutoffTop = 280;
    const cutoffLeft = 160;
    
    return isMobile ? true : (
      parent.offsetTop < cutoffTop || 
      parent.offsetLeft < cutoffLeft || 
      (window.innerWidth - relativeOffsetLeft) < 200
    );
  }

 


  render() {
    console.log('SimpleMapMarker - location', this.props.location);
    const currentStatus = getOpeningHours(this.props.location);
    console.log('map-marker status: ',currentStatus);

    //FORMAT ADDRESS
    const streetAddress = [
      this.props.location.address,
      this.props.location.address2,
      this.props.location.address3
    ].filter(Boolean).join(', ');
    const cityAddress = [
      this.props.location.city, 
      this.props.location.state, 
      this.props.location.postcode
    ].filter(Boolean).join(' ');

    //FORMAT PHONE/FAX NUMBERS
    const formatPhoneNumber = (phoneNumber) => {
      if(!phoneNumber) return '';

      let formattedNumber = phoneNumber.startsWith('+61')
      ? '0' + phoneNumber.slice(3)
      : phoneNumber;

      return formattedNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
    }

    //DIRECTIONS BUTTON
    const directionsButton = (lat, long) => {
      if (!lat || !long) return '';

      let directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
      return directionsUrl;
    }


    const containerClasses = classNames({
      'c-map__marker-container': true,
      'is-highlighted': this.props.highlighted
    });

    const bubbleClasses = classNames({
      'c-map__info-bubble': true,
      'is-active': this.props.active,
    });

    const mapMarkerClasses = classNames({
      'c-map__marker': true
    });

    return (
      <div className={containerClasses}>
        <div 
          className={mapMarkerClasses} 
          onClick={this.onSelect} 
          onMouseEnter={this.onMouseOver} 
          onMouseOut={this.onMouseOut}>
        </div>
        
        <div className={bubbleClasses}>
          <h5>{this.props.location.name}</h5>
          <p>{streetAddress}, {cityAddress}</p>
          <p>{formatPhoneNumber(this.props.location.phone)}</p>
          <p>{currentStatus}</p>
          <p><a className="button map-button" href={directionsButton(this.props.location.geometry.coordinates[1], this.props.location.geometry.coordinates[0])} target="_blank" rel="noopener noreferrer">Get Directions</a></p>
        </div>
      </div>
    );
  }
}

SimpleMapMarker.propTypes = {
  active: PropTypes.bool,
  handleSelectLocation: PropTypes.func,
  highlighted: PropTypes.bool,
  location: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    monday: PropTypes.object,
    tuesday: PropTypes.object,
    wednesday: PropTypes.object,
    thursday: PropTypes.object,
    friday: PropTypes.object,
    saturday: PropTypes.object,
    sunday: PropTypes.object,
  }),
};

SimpleMapMarker.defaultProps = {
    active: true,
};

export default SimpleMapMarker;