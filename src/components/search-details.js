'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import getOpeningHours from '../helpers/get-opening-hours';
import onSendUserAction from '../helpers/on-send-user-action';
import fixURL from '../helpers/fix-url';
import Swal from 'sweetalert2';
import _ from 'lodash';

const SearchDetails = props => {

  const renderStringFromArray = property => {
    return !props.location[property] ? '' : 
      props.location[property].split('|')
        .map(( value, key ) => ( <p key={key}>{ value }</p> ));
  };

  const renderServicesFromArray = data => {
    return !data ? '':
      data.split('|')
      .map((value, key) => ( <p key={key}>{value}</p>));
  };

  const content = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const xmas = "Fri Jan 26 2024";
  const hourExceptions = props.location.openingHourExceptions;
  const todayDate = moment().format('YYYY/MM/DD');
  const yesterdayDate = moment(todayDate).subtract(1,'days');
  const monthPeriod = moment(todayDate).add(28,'days');

  console.log('todayDate = ' + todayDate );

  //Remove duplicate Opening Hour Exceptions  
  if (hourExceptions && hourExceptions.length != -1){
    var unique = Array.from(new Set(hourExceptions));
    var uniqueHours = unique.sort(sortDates);
  } 

  //Sort Opening Hour Exceptions by date
  function sortDates(a,b){
    var dateA = new Date (a.date);
    var dateB = new Date (b.date);
    return dateA > dateB ? 1:-1;
  }

  //Display Opening Hour Exceptions if they exist for pharmacy
  const newOpeningHours = () => {
    if (uniqueHours && uniqueHours.length !=-1){
      for (var i=0; i<uniqueHours.length; i++){
        uniqueHours[i].reason = uniqueHours[i].reason.replace('&#039;','\'');
      }

      //Filter Exception Dates to those within 28 days of today
      const upcomingDates = uniqueHours && uniqueHours.filter(
        uniqueHours => moment(monthPeriod).isAfter(uniqueHours.date,'days') && moment(todayDate).isSameOrBefore(uniqueHours.date)
      );     

      console.log(upcomingDates);

      //Don't print past dates, and only print up to the next 28 days

      if (upcomingDates.length > 0){
        return (
          <div className="s-filtered-search__details-section">
            <div>
              <div className="holidayHours">
                <p class="s-filtered-search__details-section__sub-heading">Holiday Trading Hours</p>

                {upcomingDates.map(({date, reason, open, close}, key) => (
                  moment(date).isBefore(monthPeriod) && moment(date).isAfter(yesterdayDate) ?
                    open == "Closed" ? <p key={key}>{moment(date).format('ddd Do MMM')} Closed ({reason})</p>:<p key={key}>{moment(date).format('ddd Do MMM')} {open} to {close} ({reason})</p>
                    : ''
                ))}
              </div>
            </div>
          </div>
        )
      } else {
        return null;
      }
    }
  };

  //Display standard Opening Hours by Day of the week
  const openingHours = days.map(( day, key ) => (
    <p key={key}>{ day } { 
      getOpeningHours( props.location, day.toLowerCase() 
    )}</p>
  ));

  //Get languages offered by pharmacy
  const languages = renderStringFromArray( 'language' ); 
  
  var services;
  var covidArray = '';

  //Print all Member and AFSPA pharmacy services
  //If non-member, only print Palliative Care Prepared service name - this is in-line with TAS program
  if (props.location.memberType == 'Premises' || props.location.memberType == 'Non-Member Ineligible AFSPA'){
      services = renderStringFromArray( 'services' );
  } else {
    if (props.location.services){
      if (props.location.services.indexOf('Palliative Care Prepared') !== -1) {
        covidArray += 'Palliative Care Prepared';
      }
    }
    services = renderServicesFromArray(covidArray);
  }

  //Print languages
  if (languages){
      content.languages =       <div className="s-filtered-search__details-section">
          <p className="s-filtered-search__details-section__sub-heading">Languages spoken:</p>
          { languages }
      </div>;
  } else {
      content.languages = '';
  }

  //'Book Now' button click action
  const onBookingClicked = e => {
    //e.preventDefault();

    /*if (props.location.state == "TAS"){
      Swal.fire({
        title: 'Age check',
        html: '1st dose of AZ only for those aged 60+ in TAS pharmacy. 2nd doses available of AZ for anyone 18+ in pharmacy.',
        icon: 'question',
        confirmButtonText: "OK, let's book",
        showCancelButton: true,
        cancelButtonText: "Don't book"
      }).then((result) => {
        if (result.isConfirmed) {
          const safariWindow = window.open();
          onSendUserAction( props.location, 'Vaccination Booking', safariWindow);
        } else if (result.isDismissed){
          console.log('cancelled');
        }
      });
    } else {    
      const safariWindow = window.open();
      onSendUserAction( props.location, 'Vaccination Booking', safariWindow);
    }*/

    const safariWindow = window.open();
    onSendUserAction( props.location, 'Vaccination Booking', safariWindow );
    //return true;
  }

  const openExternalModal = e =>{
    e.preventDefault();
    var name = props.location.name;
    Swal.fire({

      title: 'Attention',
      html: 'You are about to open the <strong>'+name+'</strong> website in a new tab/window.<br><br><strong>Find a Pharmacy</strong> will stay open in the background.',
      icon: 'question',
      confirmButtonText: 'Continue',
      cancelButtonText: 'Go back',
      showCancelButton: true,
      confirmButtonColor: '#00205b',
      cancelButtonColor: '#ffc72c',
      iconColor: '#00205b',
    }).then((result) => {
      if (result.isConfirmed){
        onBookingClicked();
        return true;
      }
    })
  }

  //Social Media Icon displays
  const socialStyles = {
    "fontSize":"1.8rem",
    "marginRight":"0.5rem"
  };

  //Check for Facebook link, and print
  const renderFacebook = () => {
      if(props.location.facebook){
        return (<a href={fixURL(props.location.facebook)} title="Facebook" target="_blank" style={socialStyles}><i className="fab fa-facebook-square"></i></a>)
      }else{
        return null;
      }
  };

  //Check for Instagram link, and print
  const renderInstagram = () => {
    if(props.location.instagram){
      return (<a href={fixURL(props.location.instagram)} title="Instagram" target="_blank" style={socialStyles}><i className="fab fa-instagram-square"></i></a>)
    }
    return null;
  };

  //Check for Twitter link, and print
  const renderTwitter = () => {
    if(props.location.twitter){
      return (<a href={fixURL(props.location.twitter)} title="Twitter" target="_blank" style={socialStyles}><i className="fab fa-twitter-square"></i></a>)
    }
    return null;
  };

  //Print 'Book Now' or 'Call Now' buttons
  const renderButton = () => {
    if (props.location.bookingurl){
      //Print 'Book Now' button if booking link exists
      //return(<p><a href={props.location.bookingurl} onClick={onBookingClicked} className="button" data-pharmacy={props.location.id} data-action="book-now" data-state={props.location.state}>Book Now</a></p>);
      return(<p><a href={props.location.bookingurl} onClick={openExternalModal} className="button" data-pharmacy={props.location.id} data-action="book-now" data-state={props.location.state}>Book Now</a></p>);
    } else {
      //Otherwise print 'Call Now' button if phone number exists
      //Also, pharmacy must offer one of the following services: COVID Vax, Flu Vax or Palliative Care Prepared
      if (props.location.phone){
        if (props.location.services){
          if (props.location.services.indexOf('COVID') !== -1 || props.location.services.indexOf('Influenza') !== -1 || props.location.services.indexOf('Palliative Care Prepared') !== -1){
            return(<p><a href={'tel:'+cleanPhone} className="button" data-pharmacy={props.location.id} data-action="call-now" data-state={props.location.state}>Call Now</a></p>);
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  };

  //Check for Website link, and print
  const renderWebsite = () => {
    if (props.location.website){
      return(<p><strong>Website: </strong><a href={fixURL(props.location.website)} target="_blank">{props.location.website}</a></p>);
    }
    return null;
  };

  //Clean phone number - ensure it is in web tel: protocol format
  const cleanPhone = props.location.phone ? props.location.phone.replace(/\s/g,''):'';
    
  //Print social media sites
  const renderSocialMedias = ()=>{
    const facebook = renderFacebook();
    const twitter = renderTwitter();
    const instagram = renderInstagram();

    if(facebook || twitter || instagram){
      return (<p>{facebook}{twitter}{instagram}</p>)
    }
  };

  //Final style declarations
  var detailsPanelClasses = classNames({
    's-filtered-search__details-section': true
  });

  if (props.location.memberType == 'Premises'){
    //do nothing
  } else if (props.location.memberType == 'Non-Member Ineligible AFSPA'){
    detailsPanelClasses = classNames({
      's-filtered-search__details-section': true,
      'afspa':true
    });
  } else {
    detailsPanelClasses = classNames({
      's-filtered-search__details-section': true,
      'nonmember':true
    });
  }

  //Print today's opening hours
  const d = moment().format('dddd').toLowerCase();
  const today = props.location[d];
  var exceptionFlag = false;

  const todayOpeningHours = () => {
    let todayOpening = "";

    if (props.location.openingHourExceptions){
      var data = props.location.openingHourExceptions;
      //Check if opening hour exceptions exists for today, and if so, print them
      //Otherwise print standard operating hours
      for (var i = 0; i < data.length; i++){
        if (data[i].date == todayDate){
          todayOpening = (data[i].open == "Closed") ? `Closed (${data[i].reason})`: `Open ${data[i].open} to ${data[i].close} (${data[i].reason})`;
          exceptionFlag = true;
        }
      } 
    } else {
      todayOpening =  getOpeningHours( props.location ) ;
    }

    if (exceptionFlag == false){
      todayOpening = todayHours();
    }

    return todayOpening;
  };

  //Get today's opening hours
  const todayHours = () => {
    if (props.location[d] && props.location[d].open){
      return `Open ${today.open} to ${today.close}`;
    } else {
      return "Closed Today";
    }
  };

  //renderSocialMedias();

  //THIS IS WHAT GETS PRINTED ON SCREEN
  return(
    <div>
      <button className="s-filtered-search__back" onClick={props.backHandler}>Back</button>
      <div className={detailsPanelClasses}>
        <h5 className="s-filtered-search__details-section__heading">
          {props.location.website?<a href={props.location.website} title={props.location.name} target="_blank" rel="noreferrer">{ props.location.name }</a>:props.location.name }
        </h5>
        <p><strong>Address: </strong>{ props.location.address + (props.location.address2? ' '+ props.location.address2:'') + (props.location.address3? ' '+ props.location.address3:'')}</p>
        <p>{ props.location.city } { props.location.state } { props.location.postcode }</p>
        <p><strong>Phone: </strong>{ props.location.phone }</p>
        {props.location.fax?<p><strong>Fax: </strong>{ props.location.fax }</p>:''}
        {props.location.email?<p><strong>Email: </strong><a href={"mailto:"+props.location.email}>{ props.location.email }</a></p>:''}
        {renderWebsite()}
        {renderButton()}
        <p><strong>{todayOpeningHours()}</strong></p>
        {renderSocialMedias()}
      </div>

      {newOpeningHours()}
      
      <div className="s-filtered-search__details-section">
        <p className="s-filtered-search__details-section__sub-heading">Standard Trading Hours</p>
        {openingHours}
      </div>

      <div className="s-filtered-search__details-section">
        <p className="s-filtered-search__details-section__sub-heading">{services?'Services Provided:':''}</p>
        { services }
      </div>
        { content.languages }
    </div>
  );
}

export default SearchDetails;

SearchDetails.propTypes = {
  backHandler: PropTypes.func,
  location: PropTypes.object,
}