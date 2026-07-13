/**
 * Family Day 2026 - Amazon BCN1 Registration App
 * Hash-based Router Module
 *
 * Manages SPA navigation using hash-based routing.
 * Routes: #/ (Landing), #/register (Form), #/success (Success), #/admin (Admin)
 */
'use strict';

var Router = (function () {
  var routes = {};

  /**
   * Returns the current hash path, defaulting to '#/' if empty.
   * @returns {string} Current route hash path
   */
  function getCurrentRoute() {
    var hash = window.location.hash;
    return hash && hash.length > 0 ? hash : '#/';
  }

  /**
   * Resolves the current route and calls the matching handler.
   * If no matching route is found, navigates to the default '#/' route.
   */
  function resolveRoute() {
    var path = getCurrentRoute();
    var handler = routes[path];

    if (typeof handler === 'function') {
      handler();
    } else if (typeof routes['#/'] === 'function') {
      // Fallback to landing page for unknown routes
      window.location.hash = '#/';
    }
  }

  /**
   * Initializes the router with route definitions and starts listening
   * for hash changes.
   * @param {Object} routeMap - Map of hash paths to handler functions
   *   e.g. { '#/': renderLanding, '#/register': renderForm, ... }
   */
  function init(routeMap) {
    routes = routeMap || {};

    // Listen for hash changes
    window.addEventListener('hashchange', resolveRoute);

    // Resolve the initial route on page load
    resolveRoute();
  }

  /**
   * Programmatically navigates to a given hash path.
   * @param {string} path - The hash path to navigate to (e.g. '#/register')
   */
  function navigate(path) {
    window.location.hash = path;
  }

  return {
    init: init,
    navigate: navigate,
    getCurrentRoute: getCurrentRoute
  };
})();
