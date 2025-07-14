import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import MapBasic from './pages/map-basic';
import MapWithSearch from './pages/map-with-search';
import Search from './pages/search';
import VicSearch from './pages/vic-search';
import QldSearch from './pages/qld-search';
import TasSearch from './pages/tas-search';
import * as serviceWorker from './serviceWorker';
import initDatabase from "./settings/init-database";
import Pharmacy from "./pages/pharmacy";
import ListView from './pages/list';
import TrackingWrapper from './helpers/tracking-wrapper';



if (document.getElementById('app-home') || document.getElementById('app-search') || document.getElementById('app-services-landing')){
    initDatabase();
}



const homeElements = document.getElementsByClassName('app-home');
for (let i = 0; i < homeElements.length; i++) {
    ReactDOM.render(
        <TrackingWrapper>
            <MapBasic />
        </TrackingWrapper>,
        homeElements[i]
    );
}

const searchElements = document.getElementsByClassName('app-search');
for (let i = 0; i < searchElements.length; i++) {
    ReactDOM.render(
        <TrackingWrapper>
            <Search />
        </TrackingWrapper>,
        searchElements[i]
    );
}

const vicElements = document.getElementsByClassName('app-vic-search');
console.log('found vic elements');
for (let i = 0; i < vicElements.length; i++) {
    console.log('rendering vicsearch to element:',vicElements.length);
    ReactDOM.render(
        <TrackingWrapper>
            <VicSearch />
        </TrackingWrapper>,
        vicElements[i]
    );
}

const tasElements = document.getElementsByClassName('app-tas-search');
console.log('found tas elements');
for (let i = 0; i < tasElements.length; i++) {
    console.log('rendering tassearch to element:',tasElements.length);
    ReactDOM.render(
        <TrackingWrapper>
            <TasSearch />
        </TrackingWrapper>,
        tasElements[i]
    );
}

const qldElements = document.getElementsByClassName('app-qld-search');
console.log('found qld elements');
for (let i = 0; i < qldElements.length; i++) {
    console.log('rendering qldsearch to element:',qldElements.length);
    ReactDOM.render(
        <TrackingWrapper>
            <QldSearch />
        </TrackingWrapper>,
        qldElements[i]
    );
}

const servicesLandingElements = document.getElementsByClassName('app-services-landing');
for (let i = 0; i < servicesLandingElements.length; i++) {
    ReactDOM.render(
        <TrackingWrapper>
            <MapWithSearch 
                defaultMapCenter={servicesLandingElements[i].getAttribute('defaultMapCenter')} 
                serviceKeyword={servicesLandingElements[i].getAttribute('serviceKeyword')} 
            />
        </TrackingWrapper>,
        servicesLandingElements[i]
    );
}

const pharmacyElements = document.getElementsByClassName('app-pharmacy');
for (let i = 0; i < pharmacyElements.length; i++) {
    ReactDOM.render(
        <TrackingWrapper>
            <Pharmacy />
        </TrackingWrapper>,
        pharmacyElements[i]
    );
}

const listElements = document.getElementsByClassName('app-list');
for (let i = 0; i < listElements.length; i++) {
    ReactDOM.render(
        <TrackingWrapper>
            <ListView/>
        </TrackingWrapper>,
        listElements[i]
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();




