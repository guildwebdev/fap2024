import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MapBasic from './pages/map-basic';
import MapWithSearch from './pages/map-with-search';
import Search from './pages/search';
import * as serviceWorker from './serviceWorker';
import initDatabase from "./settings/init-database";
import Pharmacy from "./pages/pharmacy";



if (document.getElementById('app-home') || document.getElementById('app-search') || document.getElementById('app-services-landing')){
    initDatabase();
}

if( document.getElementById('app-home')) {
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
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();




