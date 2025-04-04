'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TweenLite from 'gsap';
import scrollTo from 'gsap/ScrollToPlugin';

import SearchResultItem from './search-result-item';

class SearchResults extends Component {
  constructor( props ) {
    super( props );

    this.state = {
      previousActiveItem: null,
      isScrolling: false,
    }
  }

  /* Component lifecycle event handlers */

  componentWillReceiveProps() {
    this.setState({ previousActiveItem: document.querySelector('.s-filtered-search__results__item.is-active') })
  }

  componentDidUpdate( prevProps ) {
    if( this.props.selectedLocation.name &&
      this.props.scrollToSelectedItem &&
      this.props.results.length > 10 &&
      this.props.selectedLocation ) {
      this.scrollToActiveItem( prevProps.selectedLocation );
    }
  }

  /* Component methods */

  scrollToActiveItem( prevLocation ) {
    // scrolling disabled for now - remove the whole bit later
    const parent = document.querySelector('.s-filtered-search__results');
    if (!parent) return;
    
    const target = parent.querySelector('.s-filtered-search__results__item.is-active');
    if( !target ) return;

    console.log(target.offsetTop, target.parentNode.offsetTop);

    // TweenLite.to( parent, 0, {
    //   scrollTo: target.offsetTop - ( parent.offsetHeight * .5 ) + target.offsetHeight
    // });
  }

  //<li>Try to search for a suburb or town instead of a postcode</li>

  render() {
    const results = this.props.results.length === 0 ? 
      <>
        <div className="alert alert-danger">
          <p className="text-center"><i className="fa fa-triangle-exclamation"></i> <strong>No pharmacies found</strong></p>
          <p>There are no pharmacies that match your search criteria.</p>
        </div>
        <div className="alert alert-warning">
          <p className="text-center"><i className="fa fa-circle-info"></i> <strong>To find more pharmacies please try:</strong></p>
          <ul>
            <li>Adjust the zoom level to include a wider area</li>
            <li>Adjust any filters that are applied</li>
            <li>Search for a different location altogether</li>
          </ul>
        </div> 
      </>
      : 
      this.props.results.map( result => (

        <SearchResultItem
          key={result.id}
          result={result}
          handleClick={this.props.handleClick}
          handleMouseOver={this.props.handleMouseOver}
          active={result.name === this.props.selectedLocation.name}
          highlighted={result.name === this.props.highlightedLocation.name}
          userLocationLat={this.props.userLocationLat}
          userLocationLong={this.props.userLocationLong}
          />
    ));

    return (
      <div>
        { results }
      </div>
    );
  }
}

export default SearchResults;

SearchResults.propTypes = {
  handleClick: PropTypes.func,
  handleMouseOver: PropTypes.func,
  highlightedLocation: PropTypes.object,
  results: PropTypes.array,
  scrollToSelectedItem: PropTypes.bool,
  selectedLocation: PropTypes.object,
  userLocationLat: PropTypes.number,
  userLocationLong: PropTypes.number,
}