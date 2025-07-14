import {useEffect} from 'react';

export default function TrackingWrapper({children}) {
    useEffect(() => {
        const loadTime = Math.round(performance.now());
        console.log('loadtime: ', loadTime);

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'react_app_loaded',
            reactLoadTime: loadTime
        });
    }, []);

    return children;
}