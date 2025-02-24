import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import MapBasic from './pages/map-basic';
import MapWithSearch from './pages/map-with-search';
import Search from './pages/search';
import * as serviceWorker from './serviceWorker';
import initDatabase from "./settings/init-database";
import Pharmacy from "./pages/pharmacy";
import ListView from './pages/list';



if (document.getElementById('app-home') || document.getElementById('app-search') || document.getElementById('app-services-landing')){
    initDatabase();
}

/*if( document.getElementById('app-home')) {
    ReactDOM.render(
        <MapBasic />,
        document.getElementById('app-home')
    );
} else if( document.getElementById('app-search')) {
    ReactDOM.render(
        <Search />,
        document.getElementById('app-search')
    );
} else if( document.getElementById('app-services-landing')) {
    ReactDOM.render(
        <MapWithSearch defaultMapCenter={document.getElementById('app-services-landing').getAttribute('defaultMapCenter')} serviceKeyword={document.getElementById('app-services-landing').getAttribute('serviceKeyword')} />,
        document.getElementById('app-services-landing')
    );
} else if (document.getElementById('app-pharmacy')){
    ReactDOM.render(
        <Pharmacy />,
        document.getElementById('app-pharmacy')
    );
}*/

const homeElements = document.getElementsByClassName('app-home');
for (let i = 0; i < homeElements.length; i++) {
    ReactDOM.render(
        <MapBasic />,
        homeElements[i]
    );
}

const searchElements = document.getElementsByClassName('app-search');
for (let i = 0; i < searchElements.length; i++) {
    ReactDOM.render(
        <Search />,
        searchElements[i]
    );
}

const vicElements = document.getElementsByClassName('app-vic-search');
for (let i = 0; i < searchElements.length; i++) {
    ReactDOM.render(
        <VicSearch />,
        searchElements[i]
    );
}

const servicesLandingElements = document.getElementsByClassName('app-services-landing');
for (let i = 0; i < servicesLandingElements.length; i++) {
    ReactDOM.render(
        <MapWithSearch 
            defaultMapCenter={servicesLandingElements[i].getAttribute('defaultMapCenter')} 
            serviceKeyword={servicesLandingElements[i].getAttribute('serviceKeyword')} 
        />,
        servicesLandingElements[i]
    );
}

const pharmacyElements = document.getElementsByClassName('app-pharmacy');
for (let i = 0; i < pharmacyElements.length; i++) {
    ReactDOM.render(
        <Pharmacy />,
        pharmacyElements[i]
    );
}

const listElements = document.getElementsByClassName('app-list');
for (let i = 0; i < listElements.length; i++) {
    ReactDOM.render(
        <ListView/>,
        listElements[i]
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();




