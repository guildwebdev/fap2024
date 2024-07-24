import axios from "axios";
import globalSettings from "./global";
import { func } from "prop-types";

export default function initDatabase(){
    console.log('init db');
    window.canIndexedDB = true;
    let updateTime = localStorage.getItem('updateTime');
    let currentTime = (new Date()).getTime();
    let databaseShouldUpdate = false;

    //const threedays = '259200000';
    //const oneday = '86400000';
    const twelvehours = '43200000';
    //const sixhours = '21600000';
    //const threehours = '10800000'; 
    //const onehour = '3600000';
    //const tenmins = '600000';
    //const onemins = '60000';

    if(updateTime == null || ((currentTime - parseInt(updateTime)) >= parseInt(twelvehours))){
        updateTime =  currentTime;
        databaseShouldUpdate = true;
    }

    let database = indexedDB.open("baseData",parseInt(updateTime/1000000000));

    database.onupgradeneeded = function(){
        let db = database.result;

        if(!db.objectStoreNames.contains('locations')){
            db.createObjectStore('locations',{keyPath:'id'});
        } 
        databaseShouldUpdate = true;
    }

    

    database.onsuccess = function(){
        if(database.result.close(), databaseShouldUpdate){
            let req = indexedDB.deleteDatabase("baseData");
            localStorage.removeItem("updateTime");

            req.onsuccess = function(){
                //database.open();
                indexedDB.open(database);
            }

            axios
                .get(globalSettings.locationMainURL)
                .then(response => {
                    let db = database.result;
                    let objstore = db.transaction('locations',"readwrite").objectStore('locations');
                    let data = response.data.results;
                    updateTime = (new Date()).getTime();
                    let i = 0;
                    function putNext(index){
                        if (i<data.length) { 
                            console.log(i);
                            objstore.put(data[i]).onsuccess = putNext;
                            ++i;
                        }
                    }
                    putNext();
                    localStorage.setItem('updateTime',updateTime);
                }).catch((e)=>{
                    console.log(e.response);
                });
        }
    }

    database.onerror = function(e){
        console.log('into new error');
        let req = indexedDB.deleteDatabase("baseData");
        req.onsuccess = function(){
            console.log('about to re-init again');
            initDatabase();
        }
        window.canIndexedDB = false;
    }

}
