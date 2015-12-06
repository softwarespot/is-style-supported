/*
 * isStyleSupported
 * Detect support for CSS properties and their assignable values
 *
 * @param {string} property
 * @param {string} value (optional)
 * @return {boolean}
 */

(function isStyeSupportedModule(window) {
    var _element = window.document.createElement('div');
    var _prefixes = ['Webkit', 'Moz', 'O', 'ms'];
    var _reToCamelCase = /(?:-+([^\-]))/g;

    // Convert CSS notation (kebab-case) to DOM notation (camelCase)
    function toCamelCase(property) {
        return property.replace(_reToCamelCase, function charToUpper(all, char) {
            return char.toUpperCase();
        });
    }

    // Test the different native APIs for CSS support
    function checkNativeSupport(property, value) {
        // Check the standard method first
        if (window.hasOwnProperty('CSS') && window.CSS.supports) {
            return window.CSS.supports(property, value);
        }

        // Check for Opera's native method
        if (window.supportsCSS) {
            return window.supportsCSS(property, value);
        }

        return false;
    }

    // Determine support by actually applying the property/value
    // as CSS to the test element and checking if the property
    // exists in the style object
    function canSetProperty(property, camel, value) {
        var support = _element.style.hasOwnProperty(camel);
        if (value === 'inherit') {
            return support;
        }

        _element.style.cssText = property + ':' + value;
        return support && _element.style[camel] !== '';
    }

    // Define `isStyleSupported` globally
    window.isStyleSupported = function isStyleSupported(property, value) {
        // If no value is supplied, use "inherit" by default
        value = value || 'inherit';

        // Check native methods first
        var support = checkNativeSupport(property, value);
        if (support) {
            return true;
        }

        var camel = toCamelCase(property);

        var index = 0;
        var capitalized = camel[index++].toUpperCase() + camel.slice(index);

        // Check if the property/value can be applied to an element
        support = canSetProperty(property, camel, value);
        var length = _prefixes.length;
        while (!support && length--) {
            // We repeat the previous steps here, this time trying
            // each vendor prefix to determine support
            var prefixed = '-' + _prefixes[length].toLowerCase() + '-' + property;
            support = checkNativeSupport(prefixed, value);
            if (!support) {
                camel = _prefixes[length] + capitalized;
                support = canSetProperty(prefixed, camel, value);
            }
        }

        return support;
    };
})(window);
