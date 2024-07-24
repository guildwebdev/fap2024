import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import renderPropertyList from '../helpers/render-property-list';
import onSendUserAction from '../helpers/on-send-user-action';
import Swal from 'sweetalert2';
import { property } from 'lodash';
import { trackCustom } from 'react-facebook-pixel';

const SearchResultItem = props => {
  const today = moment().format('dddd').toLowerCase();
  const xmas = "Fri Jan 26 2024";
  const todayDate = moment().format('YYYY/MM/DD');

  /* Event handlers */
  const onBookingClicked = e => {
    //e.preventDefault();
    const safariWindow = window.open();
    onSendUserAction( props.result, 'Vaccination Booking', safariWindow );
    //return true;
  }

  const openExternalModal = e =>{
    e.preventDefault();
    var name = props.result.name;
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

  const handleClick = e => {
    e.preventDefault();
    var ratSearch = sessionStorage.getItem('ratsearch');
    if (ratSearch){
      onSendUserAction(props.result, 'RAT Search','','guildOnly');
    } 

    props.handleClick( props.result, true, true );
  };

  const handleMouseLeave = e => {
    props.handleMouseOver( {} );
  };

  const handleMouseEnter = e => {
    props.handleMouseOver( props.result );
  };

  /* Computed properties */
  var exceptionFlag = false;
  const openingHours = () => {
    let todayOpening = '';
    //Check for exception hours for pharmacy
    //If today has exception hours, print them
    //Otherwise, print standard hours
    if (props.result.openingHourExceptions){
      var data = props.result.openingHourExceptions;
      for (var i = 0; i < data.length; i++){
        if (data[i].date == todayDate){
          todayOpening = (data[i].open == "Closed") ? `Closed (${data[i].reason})`: `Open ${data[i].open} to ${data[i].close} (${data[i].reason})`;
          exceptionFlag = true;
        }
      } 
    } else {
      todayOpening = todayHours();
    }

    if (exceptionFlag == false){
      todayOpening = todayHours();
    }

    return todayOpening;
   };

   //Get today's opening hours
   const todayHours = () => {
      if (props.result[today] && props.result[today].open){
        return `Open ${props.result[today].open} to ${props.result[today].close}`;
      } else {
        return "Closed Today";
      }
   };

   //Clean phone number so that tel: protocal can use it
   const cleanPhone = props.result.phone ? props.result.phone.replace(/\s/g,''):'';


      //Print 'Book Now' or 'Call Now' button
   const renderButton = () => {
    if (props.result.bookingurl){
      //return(<p><a href={props.result.bookingurl} onClick={onBookingClicked} className="button" data-pharmacy={props.result.id} data-action="book-now" data-state={props.result.state}>Book now</a></p>);
      return(<p><a href={props.result.bookingurl} onClick={openExternalModal} className="button" data-pharmacy={props.result.id} data-action="book-now" data-state={props.result.state}>Book now</a></p>);
    } else {
      if (props.result.phone){
        if (props.result.services){
          if (props.result.services.indexOf('COVID') !== -1 || props.result.services.indexOf('Influenza') !== -1){
            return(<p><a href={'tel:'+cleanPhone} className="button" data-pharmacy={props.result.id} data-action="call-now" data-state={props.result.state}>Call Now</a></p>);
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    }
  };
  
  //Set style definitions
  var classes = classNames({
    's-filtered-search__results__item':true,
    'is-active': props.active,
    'is-highlighted': props.highlighted,
  });

  if (props.result.memberType == 'Non-Member'){
    if (props.result.services){
      if (props.result.services.indexOf('Palliative Care Prepared') == -1 || props.result.services.indexOf('Palliative Care Medicines Pharmacy Network') == -1){
        classes = classNames({
          's-filtered-search__results__item': true,
          'hideme': true,
        });
      }
    }
  }

  if (props.result.memberType == 'Premises'){
    //leave classes as is
  } else if (props.result.memberType == "Non-Member Ineligible AFSPA") {
     classes = classNames({
      's-filtered-search__results__item':true,
      'afspa':true,
      'is-active': props.active,
      'is-highlighted': props.highlighted,
    });
  } else if (props.result.memberType == null) {
    classes = classNames({
      's-filtered-search__results__item': true,
      'hidden': true
    });
  } else {
    //hide non-members unless they are from TAS/SA and offering Palliative Care
    if (props.result.services){
      if (props.result.services.indexOf('Palliative Care Prepared') == -1 || props.result.services.indexOf('Palliative Care Medicines Pharmacy Network') == -1){
        classes = classNames({
          's-filtered-search__results__item':true,
          'nonmember':true,
          'is-active': props.active,
          'is-highlighted': props.highlighted,
          'hidden': true,
        });
      } else {
        if (props.result.state != 'TAS'){
          classes = classNames({
            's-filtered-search__results__item':true,
            'nonmember':true,
            'is-active': props.active,
            'is-highlighted': props.highlighted,
            'hidden': true,
          });
        } else if (props.result.start != 'SA') {
          classes = classNames({
            's-filtered-search__results__item':true,
            'nonmember':true,
            'is-active': props.active,
            'is-highlighted': props.highlighted,
            'hidden': true,
          });
        } else {
          classes = classNames({
            's-filtered-search__results__item':true,
            'nonmember':true,
            'is-active': props.active,
            'is-highlighted': props.highlighted,
          });
        }
      }
    } 
  }  

  //THIS IS WHAT GETS PRINTED ON SCREEN
  return (
    <li className={classes}>
      <span 
        className="s-filtered-search__results__link"  
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        >
        <h5 className="s-filtered-search__heading">
          {props.result.name}</h5>
        <div className="s-filtered-search__details-wrapper">
            <p>{ openingHours() }</p>
            <p>{ props.result.phone }</p>
        </div>
        {renderButton()}
        <p><a href="#"
          onClick={handleClick}
        >See details</a></p>
        <span className="s-filtered-search__divider"></span>
      </span>
    </li>
  );
}

export default SearchResultItem;

SearchResultItem.propTypes = {
  active: PropTypes.bool,
  handleClick: PropTypes.func,
  handleMouseOver: PropTypes.func,
  highlighted: PropTypes.bool,
  result: PropTypes.object,
}