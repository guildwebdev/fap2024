'use strict';

const fixURL = (url) => {
    url = url.trim();
    
    if (!url.startsWith("http://") && !url.startsWith("https://")){
        url = 'https://' + url;
    } 

    url = url.replace(/^http:\/\//i, 'https://');

    if (!url.match(/^https?:\/\/www\./i)) {
        url = url.replace(/^(https:\/\/)/, '$1www.');
    }

    return url;
}

export default fixURL;