'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class UserMarker extends Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <div className="fap-map__marker-container">
        <div className="fap-map__marker fap-map__marker--user">
        </div>
      </div>
    );
  }
}

export default UserMarker;

UserMarker.propTypes = {
  location: PropTypes.object,
}