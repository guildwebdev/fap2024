'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ServiceListItem = props => {
  /* Event handlers */

  const onClick = e => {
    e.preventDefault();
    props.handleClick( props.service );
  }

  /* Computed properties */

  const classes = classNames({
    'c-filters__item': true,
    'is-active': props.active,
  });

  return(
    <li className={classes}>
      <a href="#" onClick={onClick}>{ props.service }</a>
    </li>
  );
}

export default ServiceListItem;

ServiceListItem.propTypes = {
  active: PropTypes.bool,
  handleClick: PropTypes.func,
  service: PropTypes.string,
}