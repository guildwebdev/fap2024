'use strict';

const fixURL = (url) => {
    if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0){
        return (url);
    } else {
        return ("http://"+url);
    }
}

export default fixURL;