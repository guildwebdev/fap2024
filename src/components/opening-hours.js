import React, { useState } from 'react';
import getOpeningHours from '../helpers/get-opening-hours';

const OpeningHours = ({ location }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const renderSchedule = (dayName) => {
    const dayLower = dayName.toLowerCase();
    const schedule = location[dayLower];
    
    return schedule && (schedule.open != 'Closed') ? (      
      <span className="open-status__schedule-time small">
        <span className="open-status__schedule-date"><strong>{dayName}</strong>:</span>
        {schedule.open} - {schedule.close}
      </span>
    ) : (
      <span className="open-status__schedule-time small">
        <span className="open-status__schedule-date"><strong>{dayName}</strong>:</span>
        Closed
      </span>
    );
  };

  const status = getOpeningHours(location);
  const isOpen = status.includes('Open now');

  return (
    <span 
      className={`open-status ${isOpen ? 'open-status__opened' : 'open-status__closed'}`} 
      onClick={handleClick}
    >
      {status} 
       <i className="fa-solid fa-chevron-down"></i> 
      <span className={`open-status__schedule ${isActive ? 'active' : ''}`}>
        {renderSchedule('Monday')}
        {renderSchedule('Tuesday')}
        {renderSchedule('Wednesday')}
        {renderSchedule('Thursday')}
        {renderSchedule('Friday')}
        {renderSchedule('Saturday')}
        {renderSchedule('Sunday')}
      </span>
    </span>
  );
};

export default OpeningHours;