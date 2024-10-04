import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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
    console.log('into SimpleMapMarker');
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
          <p>{this.props.location.address}</p>
          <p>{this.props.location.phone}</p>
        </div>
      </div>
    );
  }
}

SimpleMapMarker.propTypes = {
  active: PropTypes.bool,
  handleSelectLocation: PropTypes.func,
  highlighted: PropTypes.bool,
  location: PropTypes.object,
};

SimpleMapMarker.defaultProps = {
    active: true,
};

export default SimpleMapMarker;