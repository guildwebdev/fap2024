'use strict';

/*const fixURL = (url) => {
    url = url.trim();
    
    if (!url.startsWith("http://") && !url.startsWith("https://")){
        url = 'https://' + url;
    } 

    url = url.replace(/^http:\/\//i, 'https://');

    if (!url.match(/^https?:\/\/www\./i)) {
        url = url.replace(/^(https:\/\/)/, '$1www.');
    }

    return url;
}*/
const fixURL = (url) => {
    if (!url) return ''; // Handle null or undefined input gracefully

    url = url.trim();

    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    // Upgrade to HTTPS if necessary
    url = url.replace(/^http:\/\//i, 'https://');

    // Add 'www.' only if the domain doesn't already contain 'www.'
    if (!/^https?:\/\/(www\.)?/i.test(url)) {
        const protocol = url.match(/^https?:\/\//i)[0]; // Extract protocol
        url = url.replace(protocol, `${protocol}www.`);
    }

    try {
        // Validate URL using the URL constructor
        new URL(url);
    } catch (e) {
        console.error('Invalid URL:', url);
        return ''; // Return an empty string for invalid URLs
    }

    return url;
};

export default fixURL;