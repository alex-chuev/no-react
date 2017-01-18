(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["NoReact"] = factory();
	else
		root["NoReact"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Component_1 = __webpack_require__(1);
	exports.Component = Component_1.Component;
	var createElement_1 = __webpack_require__(3);
	exports.createElement = createElement_1.createElement;
	var render_1 = __webpack_require__(5);
	exports.render = render_1.render;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BaseComponent_1 = __webpack_require__(2);
	var Component = (function (_super) {
	    __extends(Component, _super);
	    function Component(properties, content) {
	        var _this = _super.call(this, properties) || this;
	        _this.renderComponent(content);
	        return _this;
	    }
	    Component.prototype.renderComponent = function (content) {
	        this.beforeRender();
	        this.appendChildComponent(this.render(content));
	        this.afterRender();
	    };
	    Component.prototype.beforeRender = function () {
	    };
	    Component.prototype.afterRender = function () {
	    };
	    Component.prototype.appendChildComponent = function (child) {
	        this.element = child.element;
	        this.children.push(child);
	    };
	    Component.prototype.destroy = function () {
	        this.beforeDestroy();
	        _super.prototype.destroy.call(this);
	        this.afterDestroy();
	    };
	    Component.prototype.beforeDestroy = function () {
	    };
	    Component.prototype.afterDestroy = function () {
	    };
	    return Component;
	}(BaseComponent_1.BaseComponent));
	exports.Component = Component;


/***/ },
/* 2 */
/***/ function(module, exports) {

	var BaseComponent = (function () {
	    function BaseComponent(properties) {
	        this.properties = properties;
	        this.children = [];
	    }
	    BaseComponent.prototype.destroy = function () {
	        this.destroyChildren();
	        this.removeElement();
	    };
	    BaseComponent.prototype.destroyChildren = function () {
	        this.children.forEach(function (child) { return child.destroy(); });
	    };
	    BaseComponent.prototype.removeElement = function () {
	        if (this.element.parentNode) {
	            this.element.parentNode.removeChild(this.element);
	        }
	    };
	    return BaseComponent;
	}());
	exports.BaseComponent = BaseComponent;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var ElementComponent_1 = __webpack_require__(4);
	function createElement(element, properties) {
	    var content = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        content[_i - 2] = arguments[_i];
	    }
	    if (typeof element === 'string') {
	        return new ElementComponent_1.ElementComponent(element, properties, content);
	    }
	    else {
	        return new element(properties, content);
	    }
	}
	exports.createElement = createElement;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BaseComponent_1 = __webpack_require__(2);
	var ElementComponent = (function (_super) {
	    __extends(ElementComponent, _super);
	    function ElementComponent(elementName, properties, content) {
	        var _this = _super.call(this, properties) || this;
	        _this.elementName = elementName;
	        _this.render(content);
	        return _this;
	    }
	    ElementComponent.prototype.render = function (content) {
	        this.createElement();
	        this.setAttributes();
	        this.renderContent(content);
	    };
	    ElementComponent.prototype.createElement = function () {
	        this.element = document.createElement(this.elementName);
	    };
	    ElementComponent.prototype.setAttributes = function () {
	        var _this = this;
	        Object.keys(this.properties)
	            .forEach(function (key) { return _this.element[key] = _this.properties[key]; });
	    };
	    ElementComponent.prototype.renderContent = function (content) {
	        if (Array.isArray(content)) {
	            content.forEach(this.renderContent, this);
	        }
	        else if (content instanceof BaseComponent_1.BaseComponent) {
	            this.appendChildComponent(content);
	        }
	        else {
	            this.element.appendChild(document.createTextNode(content));
	        }
	    };
	    ElementComponent.prototype.appendChildComponent = function (child) {
	        this.element.appendChild(child.element);
	        this.children.push(child);
	    };
	    return ElementComponent;
	}(BaseComponent_1.BaseComponent));
	exports.ElementComponent = ElementComponent;


/***/ },
/* 5 */
/***/ function(module, exports) {

	function render(component, element) {
	    element.innerHTML = '';
	    element.appendChild(component.element);
	}
	exports.render = render;


/***/ }
/******/ ])
});
;