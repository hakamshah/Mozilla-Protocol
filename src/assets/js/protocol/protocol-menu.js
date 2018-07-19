/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof Mozilla === 'undefined') {
    var Mozilla = {};
}

(function() {
    'use strict';

    var Menu = {};
    var _hoverTimeout;
    var _mqWideNav;
    var _options = {
        onMenuOpen: null,
        onMenuClose: null,
        onMenuButtonClose: null
    };

    Menu.open = function(el, animate) {
        if (animate) {
            el.classList.add('animate');
        }

        el.classList.add('selected');
        el.setAttribute('aria-selected', true);
        el.setAttribute('aria-expanded', true);

        if (typeof _options.onMenuOpen === 'function') {
            _options.onMenuOpen(el);
        }
    };

    Menu.close = function() {
        // On small screens more than one menu can be open at the same time.
        var current = document.querySelectorAll('.mzp-c-menu-category.selected');

        for (var i = 0; i < current.length; i++) {
            current[i].classList.remove('animate');
            current[i].classList.remove('selected');
            current[i].setAttribute('aria-selected', false);
            current[i].setAttribute('aria-expanded', false);
        }

        if (typeof _options.onMenuClose === 'function' && current.length > 0) {
            _options.onMenuClose();
        }

        return current.length > 0;
    };

    Menu.onCloseButtonClick = function(e) {
        e.preventDefault();

        if (typeof _options.onMenuButtonClose === 'function') {
            _options.onMenuButtonClose();
        }

        Menu.close();
    };

    Menu.toggle = function(el) {
        var state = el.classList.contains('selected') ? true : false;

        if (!state) {
            Menu.open(el);
        } else {
            Menu.close();
        }
    };

    Menu.onMouseEnter = function(e) {
        clearTimeout(_hoverTimeout);

        // Only open the panel if the user shows hover intent
        _hoverTimeout = setTimeout(function() {
            var current = Menu.close();
            var animate = current ? false: true;

            Menu.open(e.target, animate);
        }, 150);
    };

    Menu.onMouseLeave = function() {
        // Clear hover intent timer.
        clearTimeout(_hoverTimeout);

        _hoverTimeout = setTimeout(function() {
            Menu.close();
        }, 150);
    };

    Menu.onFocusOut = function() {
        var self = this;

        /**
         * After an element loses focus, `document.activeElement` will always be `body` before
         * moving to the next element. A `setTimeout` of `0` circumvents this issue as it
         * re-queues the JavaScript to run at the end of the current excecution.
         */
        setTimeout(function() {
            if (!self.contains(document.activeElement)) {
                Menu.close();
            }
        }, 0);
    };

    Menu.onClickWide = function(e) {
        e.preventDefault();
        Menu.close();
        Menu.open(e.target.parentNode);
    };

    Menu.onClickSmall = function(e) {
        e.preventDefault();
        Menu.toggle(e.target.parentNode);
    };

    Menu.isWideViewport = function() {
        return _mqWideNav.matches;
    };

    Menu.handleState = function() {
        _mqWideNav = matchMedia('(min-width: 768px)');

        _mqWideNav.addListener(function(mq) {
            Menu.close();

            if (mq.matches) {
                Menu.unbindEventsSmall();
                Menu.bindEventsWide();
            } else {
                Menu.unbindEventsWide();
                Menu.bindEventsSmall();
            }
        });

        if (Menu.isWideViewport()) {
            Menu.bindEventsWide();
        } else {
            Menu.bindEventsSmall();
        }
    };

    Menu.bindEventsWide = function() {
        var items = document.querySelectorAll('.mzp-c-menu-category.mzp-has-drop-down');
        var link;
        var close;

        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('mouseenter', Menu.onMouseEnter, false);
            items[i].addEventListener('mouseleave', Menu.onMouseLeave, false);
            items[i].addEventListener('focusout', Menu.onFocusOut, false);

            link = items[i].querySelector('.mzp-c-menu-title');
            link.addEventListener('click', Menu.onClickWide, false);

            close = items[i].querySelector('.mzp-c-menu-button-close');
            close.addEventListener('click', Menu.onCloseButtonClick, false);
        }
    };

    Menu.unbindEventsWide = function() {
        var items = document.querySelectorAll('.mzp-c-menu-category.mzp-has-drop-down');
        var link;
        var close;

        for (var i = 0; i < items.length; i++) {
            items[i].removeEventListener('mouseenter', Menu.onMouseEnter, false);
            items[i].removeEventListener('mouseleave', Menu.onMouseLeave, false);
            items[i].removeEventListener('focusout', Menu.onFocusOut, false);

            link = items[i].querySelector('.mzp-c-menu-title');
            link.removeEventListener('click', Menu.onClickWide, false);

            close = items[i].querySelector('.mzp-c-menu-button-close');
            close.removeEventListener('click', Menu.onCloseButtonClick, false);
        }
    };

    Menu.bindEventsSmall = function() {
        var items = document.querySelectorAll('.mzp-c-menu-category.mzp-has-drop-down .mzp-c-menu-title');

        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('click', Menu.onClickSmall, false);
        }
    };

    Menu.unbindEventsSmall = function() {
        var items = document.querySelectorAll('.mzp-c-menu-category.mzp-has-drop-down .mzp-c-menu-title');

        for (var i = 0; i < items.length; i++) {
            items[i].removeEventListener('click', Menu.onClickSmall, false);
        }
    };

    /**
     * Enables simplified menu using pure CSS hover states.
     */
    Menu.cssFallback = function() {
        var menu = document.querySelector('.mzp-c-menu');
        var currentClassName = menu.className;
        menu.className = currentClassName.replace(/mzp-c-menu/, 'mzp-c-menu mzp-c-menu-basic');
    };

    Menu.isSupported = function() {
        return typeof window.matchMedia !== 'undefined' &&
               window.matchMedia('all').addListener &&
               'classList' in document.createElement('div');
    };

    Menu.init = function(options) {

        if (typeof options === 'object') {
            for (var i in options) {
                if (options.hasOwnProperty(i)) {
                    _options[i] = options[i];
                }
            }
        }

        if (Menu.isSupported()) {
            Menu.handleState();
        } else {
            Menu.cssFallback();
        }
    };

    window.Mozilla.Menu = Menu;

})();
