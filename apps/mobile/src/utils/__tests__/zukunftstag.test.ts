import type * as ReactNative from 'react-native';
import { openZukunftstagBrowser } from '../zukunftstag';
import { BVMW_RED_HEX, ZUKUNFTSTAG_URL } from '../../config/zukunftstag';
import * as WebBrowser from 'expo-web-browser';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue(undefined),
  WebBrowserPresentationStyle: { PAGE_SHEET: 'PAGE_SHEET' },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

describe('openZukunftstagBrowser', () => {
  const platform = jest.requireMock<typeof ReactNative>('react-native').Platform;
  const openBrowserAsync = WebBrowser.openBrowserAsync as jest.MockedFunction<
    typeof WebBrowser.openBrowserAsync
  >;

  beforeEach(() => {
    platform.OS = 'ios';
    openBrowserAsync.mockClear();
  });

  it('opens the Zukunftstag URL with iOS specific options', async () => {
    await openZukunftstagBrowser();

    expect(openBrowserAsync).toHaveBeenCalledTimes(1);
    expect(openBrowserAsync).toHaveBeenCalledWith(
      ZUKUNFTSTAG_URL,
      expect.objectContaining({
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        enableBarCollapsing: true,
        controlsColor: BVMW_RED_HEX,
        toolbarColor: BVMW_RED_HEX,
      }),
    );
  });

  it('omits iOS-only options on other platforms', async () => {
    platform.OS = 'android';

    await openZukunftstagBrowser();

    const [, options] = openBrowserAsync.mock.calls.at(-1) ?? [];

    expect(options).toMatchObject({
      enableBarCollapsing: true,
      controlsColor: BVMW_RED_HEX,
      toolbarColor: BVMW_RED_HEX,
    });
    expect(options?.presentationStyle).toBeUndefined();
  });
});
