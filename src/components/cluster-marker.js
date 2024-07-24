'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ClusterMarker extends Component {
  constructor( props ) {
    super( props );
  }

  handleClick(){
    this.props.handleClusterClick(this.props.location);
  }

  render() {
    return (
      <div className="c-map__marker-container" onClick={()=>this.handleClick()}>
        <div className="c-map__marker c-map__marker--cluster">
          <p>{ this.props.count }</p>
        </div>
      </div>
    );
  }
}

export default ClusterMarker;

ClusterMarker.propTypes = {
  count: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  location: PropTypes.object,
}