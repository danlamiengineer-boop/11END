/**
 * ============================================================
 * 11END — APPLICATION FOUNDATION
 * One Network. One Destination. Everything You Need, Delivered.
 * ============================================================
 *
 * Purpose:
 * - Application bootstrap
 * - Navigation helpers
 * - Accessibility support
 * - Safe client-side utilities
 * - Location capability foundation
 * - Global application state
 *
 * This file contains NO payment secrets, API keys or credentials.
 * Production API communication will be added through the backend.
 * ============================================================
 */

'use strict';

(() => {
    /**
     * ----------------------------------------------------------
     * APPLICATION CONFIGURATION
     * ----------------------------------------------------------
     */
    const APP_CONFIG = Object.freeze({
        name: '11END',
        version: '1.0.0',
        environment: 'development',

        storageKeys: Object.freeze({
            location: '11end_user_location',
            preferences: '11end_preferences'
        }),

        selectors: Object.freeze({
            navigation: '.site-nav',
            navigationToggle: '.nav-toggle',
            navigationLinks: '.site-nav a',
            locationRequest: '[data-location-request]',
            currentYear: '[data-current-year]'
        })
    });

    /**
     * ----------------------------------------------------------
     * APPLICATION STATE
     * ----------------------------------------------------------
     */
    const state = {
        initialized: false,
        location: null
    };

    /**
     * ----------------------------------------------------------
     * SAFE DOM HELPERS
     * ----------------------------------------------------------
     */

    const getElement = (selector, parent = document) => {
        if (!selector || !parent) {
            return null;
        }

        return parent.querySelector(selector);
    };

    const getElements = (selector, parent = document) => {
        if (!selector || !parent) {
            return [];
        }

        return Array.from(parent.querySelectorAll(selector));
    };

    /**
     * ----------------------------------------------------------
     * STORAGE HELPERS
     * ----------------------------------------------------------
     */

    const storage = {
        get(key) {
            try {
                const value = window.localStorage.getItem(key);

                if (!value) {
                    return null;
                }

                return JSON.parse(value);
            } catch (error) {
                console.warn('11END: Unable to read local storage.', error);
                return null;
            }
        },

        set(key, value) {
            try {
                window.localStorage.setItem(
                    key,
                    JSON.stringify(value)
                );

                return true;
            } catch (error) {
                console.warn('11END: Unable to write local storage.', error);
                return false;
            }
        },

        remove(key) {
            try {
                window.localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('11END: Unable to remove local storage.', error);
                return false;
            }
        }
    };

    /**
     * ----------------------------------------------------------
     * NAVIGATION
     * ----------------------------------------------------------
     */

    const navigation = {
        init() {
            const nav = getElement(APP_CONFIG.selectors.navigation);
            const toggle = getElement(
                APP_CONFIG.selectors.navigationToggle
            );

            if (!nav || !toggle) {
                return;
            }

            toggle.setAttribute('aria-expanded', 'false');

            toggle.addEventListener('click', () => {
                const isOpen =
                    nav.classList.toggle('is-open');

                toggle.setAttribute(
                    'aria-expanded',
                    String(isOpen)
                );
            });

            getElements(
                APP_CONFIG.selectors.navigationLinks,
                nav
            ).forEach((link) => {
                link.addEventListener('click', () => {
                    nav.classList.remove('is-open');
                    toggle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                });
            });
        }
    };

    /**
     * ----------------------------------------------------------
     * SMOOTH INTERNAL NAVIGATION
     * ----------------------------------------------------------
     */

    const smoothNavigation = {
        init() {
            const links = getElements('a[href^="#"]');

            links.forEach((link) => {
                link.addEventListener('click', (event) => {
                    const targetId =
                        link.getAttribute('href');

                    if (
                        !targetId ||
                        targetId === '#'
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    if (
                        window.history &&
                        window.history.replaceState
                    ) {
                        window.history.replaceState(
                            null,
                            '',
                            targetId
                        );
                    }
                });
            });
        }
    };

    /**
     * ----------------------------------------------------------
     * CURRENT YEAR
     * ----------------------------------------------------------
     */

    const footer = {
        init() {
            const currentYear =
                new Date().getFullYear();

            getElements(
                APP_CONFIG.selectors.currentYear
            ).forEach((element) => {
                element.textContent = String(currentYear);
            });
        }
    };

    /**
     * ----------------------------------------------------------
     * LOCATION SERVICE
     * ----------------------------------------------------------
     *
     * This is only the frontend capability foundation.
     * Actual provider matching will happen securely on the backend.
     * ----------------------------------------------------------
     */

    const locationService = {
        isSupported() {
            return 'geolocation' in navigator;
        },

        request() {
            return new Promise((resolve, reject) => {
                if (!this.isSupported()) {
                    reject(
                        new Error(
                            'Geolocation is not supported by this browser.'
                        )
                    );
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: Number(
                                position.coords.latitude.toFixed(6)
                            ),
                            longitude: Number(
                                position.coords.longitude.toFixed(6)
                            ),
                            accuracy: Math.round(
                                position.coords.accuracy
                            ),
                            capturedAt: new Date().toISOString()
                        };

                        state.location = location;

                        storage.set(
                            APP_CONFIG.storageKeys.location,
                            location
                        );

                        resolve(location);
                    },
                    (error) => {
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000
                    }
                );
            });
        },

        getSaved() {
            return storage.get(
                APP_CONFIG.storageKeys.location
            );
        }
    };

    /**
     * ----------------------------------------------------------
     * LOCATION UI HOOK
     * ----------------------------------------------------------
     *
     * Elements can opt into location functionality later by
     * using:
     *
     * data-location-request
     * ----------------------------------------------------------
     */

    const locationUI = {
        init() {
            const locationElements = getElements(
                APP_CONFIG.selectors.locationRequest
            );

            if (!locationElements.length) {
                return;
            }

            locationElements.forEach((element) => {
                element.addEventListener('click', async () => {
                    try {
                        element.setAttribute(
                            'aria-busy',
                            'true'
                        );

                        const location =
                            await locationService.request();

                        element.dispatchEvent(
                            new CustomEvent(
                                '11end:location-ready',
                                {
                                    detail: location
                                }
                            )
                        );
                    } catch (error) {
                        element.dispatchEvent(
                            new CustomEvent(
                                '11end:location-error',
                                {
                                    detail: error
                                }
                            )
                        );
                    } finally {
                        element.removeAttribute(
                            'aria-busy'
                        );
                    }
                });
            });
        }
    };

    /**
     * ----------------------------------------------------------
     * ACCESSIBILITY
     * ----------------------------------------------------------
     */

    const accessibility = {
        init() {
            document.documentElement
                .setAttribute(
                    'data-js-enabled',
                    'true'
                );

            const navToggle =
                getElement(
                    APP_CONFIG.selectors.navigationToggle
                );

            if (
                navToggle &&
                !navToggle.getAttribute('aria-label')
            ) {
                navToggle.setAttribute(
                    'aria-label',
                    'Open navigation menu'
                );
            }
        }
    };

    /**
     * ----------------------------------------------------------
     * APPLICATION EVENT BUS
     * ----------------------------------------------------------
     *
     * Allows future modules to communicate without tightly
     * coupling every feature together.
     * ----------------------------------------------------------
     */

    const events = {
        emit(name, detail = {}) {
            document.dispatchEvent(
                new CustomEvent(name, {
                    detail
                })
            );
        },

        on(name, handler) {
            if (
                typeof handler !== 'function'
            ) {
                return;
            }

            document.addEventListener(
                name,
                handler
            );
        }
    };

    /**
     * ----------------------------------------------------------
     * APPLICATION INITIALIZATION
     * ----------------------------------------------------------
     */

    const app = {
        init() {
            if (state.initialized) {
                return;
            }

            accessibility.init();
            navigation.init();
            smoothNavigation.init();
            footer.init();
            locationUI.init();

            state.initialized = true;

            events.emit(
                '11end:ready',
                {
                    app: APP_CONFIG.name,
                    version: APP_CONFIG.version
                }
            );

            console.info(
                `${APP_CONFIG.name} ${APP_CONFIG.version} initialized.`
            );
        }
    };

    /**
     * ----------------------------------------------------------
     * PUBLIC APPLICATION API
     * ----------------------------------------------------------
     *
     * Other frontend modules can use this later without
     * exposing internal implementation details.
     * ----------------------------------------------------------
     */

    window.App11END = Object.freeze({
        config: APP_CONFIG,
        state,
        storage,
        location: locationService,
        events,
        init: app.init
    });

    /**
     * ----------------------------------------------------------
     * START APPLICATION
     * ----------------------------------------------------------
     */

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            app.init,
            { once: true }
        );
    } else {
        app.init();
    }
})();
