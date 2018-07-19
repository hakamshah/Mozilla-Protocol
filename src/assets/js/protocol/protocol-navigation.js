/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof Mozilla === 'undefined') {
    var Mozilla = {};
}

(function() {
    'use strict';

    var Navigation = {};
    var menu;
    var _options = {
        onNavOpen: null
    };

    Navigation.onClick = function(e) {
        e.preventDefault();

        // Update button state
        e.target.classList.toggle('active');

        // Update menu state
        menu.classList.toggle('open');

        // Update aria-expended state on menu.
        var expanded = menu.classList.contains('open') ? true : false;
        menu.setAttribute('aria-expanded', expanded);

        if (expanded) {
            if (typeof _options.onNavOpen === 'function') {
                _options.onNavOpen();
            }
        } else {
            if (typeof _options.onNavClose === 'function') {
                _options.onNavClose();
            }
        }
    };

    Navigation.bindEvents = function() {
        menu = document.querySelector('.mzp-c-navigation-items');
        if (menu) {
            // Menu button for small screens.
            document.querySelector('.mzp-c-navigation-menu-button').addEventListener('click', Navigation.onClick, false);
        }
    };

    Navigation.init = function(options) {

        if (typeof options === 'object') {
            for (var i in options) {
                if (options.hasOwnProperty(i)) {
                    _options[i] = options[i];
                }
            }
        }

        Navigation.bindEvents();
    };

    window.Mozilla.Navigation = Navigation;

})();
