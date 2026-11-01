import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Geolocation } from '@capacitor/geolocation';

if (Capacitor.isNativePlatform()) {
  window.TruckingCostrNative = { isNative: true };
  const watches = new Map();
  let nextWatchId = 1;

  const nativeGeolocation = {
    getCurrentPosition(success, error, options = {}) {
      Geolocation.getCurrentPosition(options).then(success).catch(error);
    },
    watchPosition(success, error, options = {}) {
      const localId = nextWatchId++;
      watches.set(localId, null);
      Geolocation.watchPosition(options, (position, failure) => {
        if (failure) error?.(failure);
        else if (position) success(position);
      }).then(nativeId => {
        if (watches.has(localId)) watches.set(localId, nativeId);
        else Geolocation.clearWatch({ id: nativeId }).catch(() => {});
      }).catch(failure => {
        watches.delete(localId);
        error?.(failure);
      });
      return localId;
    },
    clearWatch(localId) {
      const nativeId = watches.get(localId);
      watches.delete(localId);
      if (nativeId) Geolocation.clearWatch({ id: nativeId }).catch(() => {});
    },
  };

  try {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: nativeGeolocation,
    });
  } catch (error) {
    console.error('Could not attach native GPS provider', error);
  }

  function handleAuthDeepLink(rawUrl) {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== 'truckingcostrau:' || url.hostname !== 'auth' || url.pathname !== '/callback') return;
      const authParams = url.search + url.hash;
      if (authParams) {
        window.location.replace(window.location.origin + window.location.pathname + authParams);
      }
    } catch (error) {
      console.error('Invalid authentication callback URL', error);
    }
  }

  App.addListener('appUrlOpen', ({ url }) => handleAuthDeepLink(url));
  App.getLaunchUrl().then(result => {
    if (result?.url) handleAuthDeepLink(result.url);
  }).catch(() => {});
}
