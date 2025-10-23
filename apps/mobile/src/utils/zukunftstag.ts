import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { BVMW_RED_HEX, ZUKUNFTSTAG_URL } from '../config/zukunftstag';

const createBrowserOptions = (): WebBrowser.WebBrowserOpenOptions => ({
  ...(Platform.OS === 'ios'
    ? { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET }
    : {}),
  enableBarCollapsing: true,
  controlsColor: BVMW_RED_HEX,
  toolbarColor: BVMW_RED_HEX,
});

export const openZukunftstagBrowser = () =>
  WebBrowser.openBrowserAsync(ZUKUNFTSTAG_URL, createBrowserOptions());
