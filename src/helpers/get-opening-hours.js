'use strict';

import React from 'react';
import moment from 'moment';

const getOpeningHours = ( location, day ) => {
  //If no location param - exit out
  //Should never happen....
  if( !location ) return;

  //Print opening hours of 'day'
  if( day && location[day] ) {
      return(( !location[day].open ) ?
        'closed' :
        location[day].open + ' to ' + location[day].close );
  }

  //Show today's hours
  else if( !day ) {
    const today = moment().format('dddd').toLowerCase();
    const t = location[today];

    if( t && t.open ) {
      //Get opening time
      const openTime = moment().set({
       'hour' : t.open.split(':')[0],
       'minute'  : t.open.split(':')[1],
      });

      //Get closing time
      const closingTime = moment().set({
       'hour' : t.close.split(':')[0],
       'minute'  : t.close.split(':')[1],
      });

      //Has the pharmacy already closed for the day?
      if (openTime.isAfter(closingTime)){
        closingTime.add(1,'days');
      }

      //Print today's hours
      if( moment().isAfter( openTime ) && moment().isBefore( closingTime )) {
        return `Open now to ${t.close}`;
      } else {
        return 'Closed now';
      }
    }
  } 
}

export default getOpeningHours;