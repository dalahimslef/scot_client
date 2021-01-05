// Your personal API key.
// Get it here: https://console.cloud.google.com/google/maps-apis
const API_KEY = 'AIzaSyAcYS2i_W17m8dU8mIQG_WoJ8yb-kUKDc8';
const CALLBACK_NAME = 'gmapsCallback';

async function initGoogleMaps() {
    if (window.google && window.google.maps) {
        return new Promise((resolve) => {
            resolve(window.google);
        });
    }

    return new Promise((resolve, reject) => {
        // CALLBACK_NAME gets called by google maps when it is ready.
        // Set it to resolve this promise. This way we can just wait for init to complete, and google maps will
        // be ready unless something failed.
        window[CALLBACK_NAME] = () => {
            resolve(window.google);
        }

        // We inject a new script tag into
        // the `<head>` of our HTML to load
        // the Google Maps script.
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${CALLBACK_NAME}`;
        // If the script fails we reject the promise, and can catch it in a try/catch when calling init
        script.onerror = () => {
            reject('Init google maps failed');
        }
        document.querySelector('head').appendChild(script);
    });
}

export { initGoogleMaps };