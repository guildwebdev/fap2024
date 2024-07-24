'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ToggleViewButtons = props => {
  const filtersHeading = props.filtersApplied ? 'Filters applied' : 'Filters';
  const viewHeading = props.selectedView === 'map' ? 'List view' : 'Map view';

  /* Computed properties */

  const filterBtnClasses = classNames({
    'c-btn': true,
    's-filtered-search__toggle-btn': true,
    'is-active': props.filtersApplied,
  });

  const viewBtnClasses = classNames({
    'c-icon': true,
    'c-icon--list': props.selectedView === 'map',
    'c-icon--map': props.selectedView === 'list',
  });

  return (
    <div className="u-mobile-only">
      <button className={filterBtnClasses} onClick={props.handleFilterToggle}>
        <i className="c-icon c-icon--filters"></i>
        { filtersHeading }
      </button>

      <button className="c-btn s-filtered-search__toggle-btn" onClick={props.handleViewToggle}>
        <i className={viewBtnClasses}></i>
        { viewHeading }
      </button>
    </div>
  );
}

export default ToggleViewButtons;

ToggleViewButtons.propTypes = {
  filtersApplied: PropTypes.bool,
  handleFilterToggle: PropTypes.func,
  handleViewToggle: PropTypes.func,
  selectedView: PropTypes.string,
}