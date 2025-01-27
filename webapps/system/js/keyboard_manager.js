'use strict';

/* global IMESwitcher, ImeMenu, KeyboardHelper, inputWindowManager,
          InputLayouts, LazyLoader, DynamicInputRegistry,
          InputWindowManager */

/**
 * For some flow diagrams related to input management, please refer to
 * https://wiki.mozilla.org/Gaia/System/InputManagement#Flow_Diagrams .
 */

// These input types are handled by the value selector for now.
const VALUE_SELECTOR_INPUT_TYPES = [
  'select-one', 'select-multiple', 'date',
  'time', 'datetime', 'datetime-local'];

const TYPE_GROUP_MAPPING = {
  // text
  'text': 'text',
  'textarea': 'text',
  'url': 'url',
  'email': 'email',
  'password': 'password',
  'search': 'text',
  // number
  'number': 'number',
  'tel': 'number',
  // option
  'select-one': 'option',
  'select-multiple': 'option',
  'time': 'option',
  'week': 'option',
  'month': 'option',
  'date': 'option',
  'datetime': 'option',
  'datetime-local': 'option',
  'color': 'option'
};

// How long to wait before we actually switch layouts
const SWITCH_CHANGE_DELAY = 20;

window.KeyboardManager = {
  // this info keeps the current keyboard's input type group; the string serves
  // as a reference to access inputLayouts.layouts[group] for current layout's
  // index and the layout.
  // when we don't have a current keyboard, this is set to null
  _showingInputGroup: null,

  _switchChangeTimeout: 0,
  _onDebug: false,
  _debug: function km_debug(msg) {
    if (this._onDebug) {
      console.log('[Keyboard Manager] ' + msg);
    }
  },

  start: function() {
    window.addEventListener('keyboardhide', this);

    navigator.b2g.inputMethod.mgmt.addEventListener('inputcontextfocus', this);
    navigator.b2g.inputMethod.mgmt.addEventListener('inputcontextblur', this);
    navigator.b2g.inputMethod.mgmt.addEventListener('showallrequest', this);
    navigator.b2g.inputMethod.mgmt.addEventListener('nextrequest', this);

    return LazyLoader.load([
      'js/ime_switcher.js',
      'js/input_window_manager.js',
      'js/input_layouts.js',
      'js/dynamic_input_registry.js',
      'http://shared.localhost:8081/js/input_mgmt/input_app_list.js',
      'http://shared.localhost:8081/js/keyboard_helper.js'
    ]).then(() => {
      window.inputWindowManager = new InputWindowManager();
      window.inputWindowManager.start();
      this.inputLayouts = new InputLayouts(this, TYPE_GROUP_MAPPING);
      this.inputLayouts.start();
      this.imeSwitcher = new IMESwitcher();
      this.imeSwitcher.ontap = this._showImeMenu.bind(this);
      this.imeSwitcher.start();
      // Defer the loading of DynamicInputRegistry only after
      // KeyboardHelper is present. Not that is possible we could miss some
      // add/removeinputrequest because of this but let's not deal with that
      // kind of extreme case.
      this.dynamicInputRegistry = new DynamicInputRegistry();
      this.dynamicInputRegistry.start();

      KeyboardHelper.watchLayouts(
        { enabled: true }, this._updateLayouts.bind(this)
      );
    });
  },

  _tryLaunchOnBoot: function km_launchOnBoot() {
    if (inputWindowManager.getLoadedManifestURLs().length) {
      // There are already keyboard(s) being launched. We don't really care
      // if a default keyboard should be launch-on-boot.
      return;
    }

    var LAUNCH_ON_BOOT_KEY = 'keyboard.launch-on-boot';
    var req = SettingsObserver.getValue(LAUNCH_ON_BOOT_KEY);
    req.onsuccess = req.onerror = (function() {
      // If the value is not set or it is set to true,
      // launch the keyboad in background
      var launchOnBoot = req.result && req.result[LAUNCH_ON_BOOT_KEY];
      if (typeof launchOnBoot !== 'boolean') {
        launchOnBoot = true;
      }

      // if there are still no keyboards running at this point -
      // set text to show, but don't bring it to the foreground.
      if (launchOnBoot &&
          !inputWindowManager.getLoadedManifestURLs().length) {
        this._preloadKeyboard();
      }
    }).bind(this);
  },

  _updateLayouts: function km_updateLayouts(layouts) {
    var enabledApps = this.inputLayouts.processLayouts(layouts);

    var manifestURLsToRemove =
      inputWindowManager.getLoadedManifestURLs().filter(
        manifestURL => !enabledApps.has(manifestURL)
      );

    // explicitly assign a variable for code clarity
    var currentLayoutRemoved =
      inputWindowManager._onInputLayoutsRemoved(manifestURLsToRemove);

    if (currentLayoutRemoved) {
      this._showingInputGroup = null;
    }

    this._tryLaunchOnBoot();
  },

  // a showing keyboard instance was OOM-killed. we need to relaunch something.
  _onKeyboardKilled: function km_onKeyboardKilled(manifestURL) {
    this._setKeyboardToShow(this._showingInputGroup);
  },

  _onKeyboardReady: function km_onKeyboardReady() {
    this._showIMESwitcher();
  },

  // As user focuses some input, see if we have a specified (in inputLayouts)
  // layout to launch for that input type group; if not, consult settings first.
  _activateKeyboard: function km_activateKeyboard(group) {
    // if we already have layouts for the group, no need to check default
    if (!this.inputLayouts.layouts[group]) {
      KeyboardHelper.checkDefaults(function changedDefaults() {
          KeyboardHelper.getLayouts({ enabled: true },
            this._updateLayouts.bind(this));
          KeyboardHelper.saveToSettings();
      }.bind(this));
    }
    // if there are still no keyboards to use, use text
    if (!this.inputLayouts.layouts[group]) {
      group = 'text';
    }

    if (this.inputLayouts.layouts[group]._activeLayoutIdx !== undefined) {
      this._setKeyboardToShow(group);
    } else {
      this.inputLayouts.getGroupCurrentActiveLayoutIndexAsync(group)
        .then(currentActiveLayoutIdx => {
          this._setKeyboardToShow(group, currentActiveLayoutIdx);
        })
        .catch(e => {
          console.error(`KeyboardManager: failed to retrieve
                         currentActiveLayoutIdx`, e);
          // launch keyboard anyway, just don't assign a default layout
          this._setKeyboardToShow(group);
        });
    }
  },

  _handleInputContextFocus: function km_handleInputContextFocus(evt) {
    var inputType = evt.detail.inputType;

    if (VALUE_SELECTOR_INPUT_TYPES.indexOf(inputType) !== -1) {
      // Hide the input window (if there is).
      inputWindowManager.hideInputWindow();

      // boardcast in the System app scope for the value selector controlling
      // logic to pick up and show the UI for this input.
      window.dispatchEvent(new CustomEvent('inputfocus', {
        detail: evt.detail
      }));
      return;
    }

    // display the keyboard for that group decided by input type
    // fallback to text for default if no group is found
    var group = TYPE_GROUP_MAPPING[inputType];
    this._debug('get focus event ' + inputType);
    this._activateKeyboard(group);
  },

  handleEvent: function km_handleEvent(evt) {
    switch (evt.type) {
      case 'showallrequest':
        this._showImeMenu();
        evt.preventDefault();
        break;

      case 'nextrequest':
        this._switchToNext();
        evt.preventDefault();
        break;

      case 'inputcontextfocus':
        this._handleInputContextFocus(evt);
        evt.preventDefault();
        break;

      case 'inputcontextblur':
        evt.preventDefault();
        this._debug('get blur event');
        inputWindowManager.hideInputWindow();
        this.imeSwitcher.hide();
        window.dispatchEvent(new CustomEvent('inputblur'));
        break;

      case 'keyboardhide':
        this._showingInputGroup = null;
        break;
    }
  },

  _preloadKeyboard: function km_preloadKeyboard() {
    if (!this.inputLayouts.layouts.text) {
      console.warn('trying to preload \'text\' layout while it\'s unavailable');
      return;
    }

    this._debug('preloading a keyboard');

    inputWindowManager.preloadInputWindow(this.inputLayouts.layouts.text[0]);
  },

  // the generic "show an input window" function to be called by
  // activateKeyboard, switchToNext, and IMESwitcher callbacks.
  // if an ayout index is specified, launch to that layout. otherwise,
  // use the layout stored in inputLayouts.
  _setKeyboardToShow: function km_setKeyboardToShow(group, index) {
    if (!this.inputLayouts.layouts[group]) {
      console.warn('trying to set a layout group to show that doesnt exist');
      return;
    }

    if (undefined === index) {
      index = this.inputLayouts.layouts[group]._activeLayoutIdx || 0;
    }
    this._debug('set layout to display: group=' + group + ' index=' + index);
    var layout = this.inputLayouts.layouts[group][index];

    inputWindowManager.showInputWindow(layout);

    this.inputLayouts.saveGroupsCurrentActiveLayout(layout);

    this._showingInputGroup = group;
  },

  /**
   * A half-permanent notification should display after the keyboard got
   * activated, and only hides after the keyboard got deactivated.
   */
  _showIMESwitcher: function km_showIMESwitcher() {
    var showedGroup = this._showingInputGroup;
    if (!this.inputLayouts.layouts[showedGroup]) {
      return;
    }

    var showedIndex = this.inputLayouts.layouts[showedGroup]._activeLayoutIdx;

    // Need to make the message in spec: "Built-in Keyboard: English".
    // These labels are already localized in InputLayouts.
    var current = this.inputLayouts.layouts[showedGroup][showedIndex];

    this.imeSwitcher.show(current.appName, current.name, current.nameL10nId);
  },

  /* A small helper function for maintaining timeouts */
  _waitForSwitchTimeout: function km_waitForSwitchTimeout(callback) {
    clearTimeout(this._switchChangeTimeout);

    this._switchChangeTimeout = setTimeout(callback, SWITCH_CHANGE_DELAY);
  },

  _switchToNext: function km_switchToNext() {
    var showedGroup = this._showingInputGroup;

    this._waitForSwitchTimeout(function keyboardSwitchLayout() {
      if (!this.inputLayouts.layouts[showedGroup]) {
        showedGroup = 'text';
      }
      var showedIndex = this.inputLayouts.layouts[showedGroup]._activeLayoutIdx;
      var length = this.inputLayouts.layouts[showedGroup].length;
      var index = (showedIndex + 1) % length;

      this._setKeyboardToShow(showedGroup, index);
    }.bind(this));
  },

  /*
   * Callback for ImeMenu.
   * If selectedIndex is defined, then some item of imeMenu was selected;
   * if it's not, then it was canceled.
   * The showedGroup param is bind()'ed by _showImeMenu
   * (resulting in a partial func)
   */
  _imeMenuCallback: function km_imeMenuCallback(showedGroup, selectedIndex) {
    if (typeof selectedIndex === 'number') {
      // success: show the new keyboard
      this._setKeyboardToShow(showedGroup, selectedIndex);

      // Hide the tray to show the app directly after user selected a new kb.
      window.dispatchEvent(new CustomEvent('keyboardchanged'));
    } else {
      // cancel: mimic the success callback to show the current keyboard.
      this._setKeyboardToShow(showedGroup);

      // Hide the tray to show the app directly after user canceled.
      window.dispatchEvent(new CustomEvent('keyboardchangecanceled'));
    }
  },

  // Show the input method menu
  _showImeMenu: function km_showImeMenu() {
    var showedGroup = this._showingInputGroup;
    var activeLayoutIdx =
      this.inputLayouts.layouts[showedGroup]._activeLayoutIdx;

    this._waitForSwitchTimeout(function listLayouts() {
      var items = this.inputLayouts.layouts[showedGroup].map(
        function(layout, index) {
          return {
            name: layout.name,
            nameL10nId: layout.nameL10nId,
            appName: layout.appName,
            value: index,
            selected: (index === activeLayoutIdx)
          };
        });

      inputWindowManager.hideInputWindow();

      LazyLoader.load(['js/ime_menu.js']).then(() => {
        var menu = new ImeMenu(items, 'choose-option',
          this._imeMenuCallback.bind(this, showedGroup),
          this._imeMenuCallback.bind(this, showedGroup));
        menu.start();
      }).catch((err) => {
        console.error(err);
      });

    }.bind(this));
  }
};
