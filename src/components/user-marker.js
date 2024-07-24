'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class UserMarker extends Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <div className="c-map__marker-container">
        <div className="c-map__marker c-map__marker--user">
        </div>
      </div>
    );
  }
}

export default UserMarker;

UserMarker.propTypes = {
  location: PropTypes.object,
}