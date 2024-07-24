'use strict';

import React from 'react';

const renderPropertyList = ( obj, property, max ) => {
  let truncated = [];

  const items = !obj[property] ? '' : 
    obj[property].split('|')
    .map(( value, key ) => ( <p key={key}>{ value }</p> ));

  if( max < items.length ) {
    truncated = items.slice( 0, max );
    if( truncated ) {
      truncated.push( `...and ${items.length - max} more` ) ;
    }
  }

  return truncated.length ? truncated : items;
}

export default renderPropertyList;
