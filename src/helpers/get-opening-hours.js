import React from 'react';
import moment from 'moment';

const getOpeningHours = (location, day) => {
  if (!location) return null;

  if (day && location[day]) {
    return !location[day].open ? 'closed' : `${location[day].open} to ${location[day].close}`;
  }

  const today = moment().format('dddd').toLowerCase();
  const t = location[today];

  if (t && t.open) {
    const openTime = moment().set({
      'hour': t.open.split(':')[0],
      'minute': t.open.split(':')[1],
    });

    const closingTime = moment().set({
      'hour': t.close.split(':')[0],
      'minute': t.close.split(':')[1],
    });

    if (moment().isAfter(openTime) && moment().isBefore(closingTime)) {
      return `Open now to ${t.close} `;
    }
    return 'Closed now ';
  }
  return 'Closed now ';
};

export default getOpeningHours;