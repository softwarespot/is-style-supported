/*
 * isStyleSupported
 * Detect support for CSS properties and their assignable values
 *
 * @param {string} property
 * @param {string} value (optional)
 * @return {boolean}
 */

(function isStyeSupportedModule(window, document) {
    var _element = document.createElement('div');

    // Check the native methods first; otherwise, return a generic function that returns false
    var _checkNativeSupport = (function nativeSupportCSS(window) {
        if (window.hasOwnProperty('CSS') && typeof window.CSS.supports === 'function') {
            return window.CSS.supports;
        }

        // Check for Opera's native method. Found only in older versions of Opera
        if (typeof window.supportsCSS === 'function') {
            return window.supportsCSS;
        }

        return function emptySupportCSS(/* property, value */) {
            return false;
        };
    })(window);

    // Order of popularity, with Opera's prefix having been deprecated
    var _prefixes = ['Webkit', 'Moz', 'ms', 'O'];
    var _prefixesCSS = ['-webkit-', '-moz-', '-ms-', '-o-'];

    // Regular expression to convert CSS notation (kebab-case) to DOM notation (camel-case)
    var _reToCamelCase = /(?:-+([^\-]))/g;

    // Determine support by applying the property/value
    // as CSS to the test element and checking if the property
    // exists in the style object
    function _canSetProperty(property, camel, value) {
        var support = _element.style.hasOwnProperty(camel);
        if (value === 'inherit') {
            return support;
        }

        _element.style.cssText = property + ':' + value;
        return support && _element.style[camel] !== '';
    }

    // Convert CSS notation (kebab-case) to DOM notation (camel-case)
    function _toCamelCase(property) {
        return property.replace(_reToCamelCase, function charToUpper(all, char) {
            return char.toUpperCase();
        });
    }

    // Define `isStyleSupported` globally
    window.isStyleSupported = function isStyleSupported(property, value) {
        // If no value is specified, then use "inherit" by default
        value = value || 'inherit';

        // Check natively first
        var support = _checkNativeSupport(property, value);
        if (support) {
            return true;
        }

        var camel = _toCamelCase(property);
        var length = 0;
        var capitalized = camel[length++].toUpperCase() + camel.slice(length);

        length = _prefixes.length;

        // Check if the property/value can be applied to an element
        support = _canSetProperty(property, camel, value);
        while (!support && length--) {
            // We repeat the previous steps here, this time trying
            // each vendor prefix to determine support
            var prefixed = _prefixesCSS[length] + property;
            support = _checkNativeSupport(prefixed, value);
            if (!support) {
                camel = _prefixes[length] + capitalized;
                support = _canSetProperty(prefixed, camel, value);
            }
        }

        return support;
    };
})(window, window.document);
