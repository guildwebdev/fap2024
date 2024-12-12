'use strict';

import axios from 'axios';
//import moment from "moment";
import globalSettings from "../settings/global";
import fixURL from "../helpers/fix-url";
import Cookies from 'js-cookie';
import ReactPixel from 'react-facebook-pixel';
import Swal from 'sweetalert2';

ReactPixel.init('208809620627632', {}, { debug: true, autoConfig: false });

// gets the user's ip address
async function getClientIp ()  {
  const res = await axios.get('https://geolocation-db.com/json/')
  return res.data.IPv4;
}

function sendData(data, location, mywin, guild) {
  try {
    // Send analytics data
    axios.post(globalSettings.sendUserActionURL, JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .catch(error => {
      console.error('Error calling PGA service', error);
    });    

    if (guild == undefined && location.bookingurl) {
      ReactPixel.track('CompleteRegistration');
 
      // Add error handling for window opening
      try {
        if (mywin != null) {
          mywin.location = location.bookingurl;
          mywin.opener = null;
        }
      } catch (windowError) {
        console.error('Error opening booking URL:', windowError);
        // Fallback - maybe open in same window or show error message
        window.open(location.bookingurl, '_blank');
      }
    } 
  } catch (error) {
    console.error('Error in sendData:', error);
  }
}

const onSendUserAction = (location, userAction, win, guild) => {
  const date_str = new Date().toISOString()

  var userCookie = Cookies.get('fapDetails');
  if (userCookie) {
    userCookie = JSON.parse(userCookie);
  } else {
    userCookie = {
      sessionId: '',
      userId: ''
    }
  }

  //console.log('function location:');
  //console.log(location);
  
  getClientIp()
    .then(ip => {
      

      const data = {
        ipAddress: ip,
        sessionId: userCookie.sessionId ? userCookie.sessionId: '',
        userId: userCookie.userId ? userCookie.userId : '',
        accountId: location.id,
        action : userAction,
        sourceUrl: window.location.href,
        destinationUrl: location.bookingurl ? location.bookingurl: '',
        dateLogged : date_str
      };

      //console.log(data);

      sendData(data, location, win, guild);

    })
    .catch(error => {
       console.error('Error gettign IP', error);
    });

};

export default onSendUserAction;