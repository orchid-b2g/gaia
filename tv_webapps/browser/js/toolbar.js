/* global Awesomescreen */
/* global Browser */
/* global BrowserDB */
/* global LazyLoader */
/* global SearchResult */
/* global SearchUtil */
/* global Settings */
/* global Tooltip*/
/* global UrlHelper */
/* global BrowserDialog */
/* global KeyEvent */
/* global SharedUtils */

'use strict';

/**
 * Browser app toolbar
 * @namespace Toolbar
 */
var Toolbar = {

  /* screen size */
  SCREEN_HEIGHT: 1080,
  SCREEN_WIDTH: 1920,

  /* zoom */
  availableZoomScale: [
    {'scale': 1.25, 'disp': '100%'},
    {'scale': 1.625,  'disp': '130%'},
    {'scale': 2.0,  'disp': '160%'},
  ],
  defaultZoomScale: 0,
  zoomScale: 0,
  availableZoomScaleYoutube: [
    {'scale': 1.55, 'disp': '100%'},
    {'scale': 1.775,  'disp': '130%'},
    {'scale': 2.0,  'disp': '160%'},
  ],

  urlButtonMode: null,
  GO: 0,
  REFRESH: 1,
  STOP: 2,
  SEARCH: 3,

  initStart: true,

  isKeyboardDisplayed: false,

  /**
   * Intialise toolbar.
   */
  init: function toolbar_init() {
    /* get Element */
    this.getAllElements();

    /* Event Listener */
    window.addEventListener('click', this);

    this.sidebarButtonBlock.addEventListener('mouseup',
        this.showHideSidebar.bind(this));

    this.sidebarButtonBlock.addEventListener('keydown',
        this.handleSidebarButtonKeydown.bind(this));

    this.sidebarButtonBlock.addEventListener('keyup',
        this.handleSidebarButtonKeyup.bind(this));

    this.backButtonBlock.addEventListener('mouseup',
        this.goBack.bind(this));

    this.backButtonBlock.addEventListener('keydown',
        this.handleBackButtonKeydown.bind(this));

    this.forwardButtonBlock.addEventListener('mouseup',
        this.goForward.bind(this));

    this.addressForm.addEventListener('submit',
        this.handleUrlFormSubmit.bind(this));

    this.addressForm.addEventListener('keydown',
        this.handleUrlFormKeydown.bind(this));

    this.addressForm.addEventListener('focus',
        this.handleUrlFormFocus.bind(this));

    this.addressForm.addEventListener('blur',
        this.handleUrlFormBlur.bind(this));

    this.addressForm.addEventListener('mouseenter',
        this.showSpaceBlockFocusStyle.bind(this));

    this.addressForm.addEventListener('mouseleave',
        this.handleUrlFormMouseLeave.bind(this));

    this.urlInput.addEventListener('input',
        this.handleUrlInputKeypress.bind(this));

    this.urlInput.addEventListener('keydown',
        this.handleUrlInputKeydown.bind(this));

    this.urlInput.addEventListener('click',
        this.handleUrlInputClick.bind(this));

    this.urlInput.addEventListener('focus',
        this.showSpaceBlockFocusStyle.bind(this));

    this.urlInput.addEventListener('blur',
        this.handleUrlInputBlur.bind(this));

    this.addressButton.addEventListener('mouseup',
        this.clickAddressButton.bind(this));

    this.searchForm.addEventListener('submit',
        this.handleSearchFormSubmit.bind(this));

    this.searchForm.addEventListener('keydown',
        this.handleSearchFormKeydown.bind(this));

    // this.searchInput.addEventListener('keyup',
    //     this.handleSearchInputKeypress.bind(this));

    this.searchInput.addEventListener('input',
        this.handleSearchInputInput.bind(this));

    this.searchInput.addEventListener('keydown',
        this.handleSearchInputKeydown.bind(this));

    this.searchInput.addEventListener('sn:willmove',
        this.handleSearchInputWillmove.bind(this));

    this.searchInput.addEventListener('click',
        this.handleSearchInputClick.bind(this));

    this.searchInput.addEventListener('blur',
        this.handleSearchInputBlur.bind(this));

    this.searchButton.addEventListener('mouseup',
        this.clickSearchButton.bind(this));

    this.searchButton.addEventListener('keydown',
        this.handleSearchButtonKeydown.bind(this));

    this.searchClearButton.addEventListener('mouseup',
        this.clickSearchClearButton.bind(this));

    this.searchClearButton.addEventListener('keydown',
        this.handleSearchClearButtonKeydown.bind(this));

    this.searchClearButton.addEventListener('keyup',
        this.handleSearchClearButtonKeyup.bind(this));

    this.searchClearButton.addEventListener('sn:willmove',
        this.handleSearchClearButtonWillmove.bind(this));

    this.searchCloseButton.addEventListener('mouseup',
        this.clickSearchCloseButton.bind(this));

    this.searchCloseButton.addEventListener('keydown',
        this.handleSearchCloseButtonKeydown.bind(this));

    this.iconbuttonBlock.addEventListener('keydown',
        this.handleIconbuttonBlockKeydown.bind(this));

    this.iconbuttonBlock.addEventListener('keyup',
        this.handleIconbuttonBlockKeyup.bind(this));

    this.bookmarkButtonBlock.addEventListener('mouseup',
        Browser.addBookmark.bind(Browser));
    this.bookmarkButtonAnime.addEventListener('animationend',
        Browser.bookmarkButtonAnimeEnd.bind(Browser));

    this.showBookmarksButtonBlock.addEventListener('mouseup',
        Awesomescreen.selectBookmarksTab.bind(Awesomescreen));

    this.homeButtonBlock.addEventListener('mouseup',
        this.clickHomeButtonBlock.bind(this));

    this.zoomButtonBlock.addEventListener('mouseup',
        this.clickZoomButtonBlock.bind(this));

    this.tabsButtonBlock.addEventListener('click',
        Awesomescreen.handleNewTab.bind(Awesomescreen));
    this.tabsButtonBlock.addEventListener('sn:willmove',
        this.handleTabButtonBlockWillmove.bind(this));

    this.menuButtonBlock.addEventListener('mouseup',
        this.clickMenuButtonBlock.bind(this));
    this.menuButtonBlock.addEventListener('sn:willmove',
        this.handleMenuButtonBlockWillmove.bind(this));

    this.menuBlock.addEventListener('keydown',
        this.handleMenuBlockKeydown.bind(this));
    this.menuBlock.addEventListener('keyup',
        this.handleMenuBlockKeyup.bind(this));

    this.historyBlock.addEventListener('mouseup',
        Awesomescreen.selectHistoryTab.bind(Awesomescreen));
    this.privateWindowBlock.addEventListener('mouseup',
        Browser.handlePrivateBrowsing.bind(Browser));
    this.settingsBlock.addEventListener('mouseup',
        Settings.show.bind(Settings));

    this.modeButtonBlock.addEventListener('mouseover',
        this.selectedModeButtonBlock.bind(this));
    this.modeButtonBlock.addEventListener('mouseout',
        this.unselectedModeButtonBlock.bind(this));

    this.toolbarPanel.dataset.search = 'false';

    var colorBar = Browser.getColorBarData();
    this.panCursorButtonBlock.dataset.colorbar = colorBar[0].COLOR;
    this.showBookmarksButtonBlock.dataset.colorbar = colorBar[1].COLOR;
    this.zoomButtonBlock.dataset.colorbar = colorBar[2].COLOR;
    this.tabsButtonBlock.dataset.colorbar = colorBar[3].COLOR;

    // li = 73px * 3(list) + 20px(hover) + 10px(padding)
    this.menuBlock.style.height = 73 * 3 + 20 + 10 + 'px';
    Tooltip.init();

//IFDEF_FIREFOX_SYNC
    LazyLoader.load('js/sync/toolbar.js');
//ENDIF_FIREFOX_SYNC
  },

  /**
   * toolbar bookmark registered check.
   */
  isBookmarks: function toolbar_isBookmarks() {
    if(Toolbar.bookmarkButton.dataset.isbookmark == 'true'){
      return true;
    }else{
      return false;
    }
  },

  /**
   * Set search engine
   */
  setSearchEngine: function toolbar_setSearchEngine() {
    var engineName = SearchUtil.getCurrentEngineName().toLowerCase();
    // favicon
    this.searchFavicon.dataset.engine = engineName;
    // placeholder
    engineName = engineName.charAt(0).toUpperCase() + engineName.slice(1);
    this.searchInput.placeholder = engineName;
    // tooltip
    document.l10n.formatValue('WB_LT_TIPS_SEARCH_BAR2', {
      engine: engineName
    }).then(val => {
      this.searchInput.dataset.tips = val;
    });
  },

  /**
   * CamelCase (xxx-yyy -> xxxYyy)
   */
  toCamelCase: function toCamelCase(str) {
    return str.replace(/-(.)/g, function replacer(str, p1) {
      return p1.toUpperCase();
    });
  },

  /**
   * Get All Elements (from id)
   */
  getAllElements: function toolbar_getAllElements() {
    var elementIDs = [
      'toolbar-panel',
      'sidebar-button-block', 'sidebar-button',
      'back-button-block', 'back-button',
      'forward-button-block', 'forward-button-border', 'forward-button',
      'space-block',
      'addressbar-block', 'address-form', 'ssl-indicator', 'url-input',
      'address-button',
      'searchbar-block', 'search-form', 'search-favicon', 'search-input',
      'search-button', 'search-clear-button', 'search-close-button',
      'iconbutton-block',
      'bookmark-button-block', 'bookmark-button',
      'show-bookmarks-button-block', 'show-bookmarks-button',
      'home-button-block', 'home-button',
      'zoom-button-block', 'zoom-button',
      'tabs-button-block', 'tabs-button',
      'menu-button-block', 'menu-button',
      'menu-block',
      'history-block', 'private-window-block',
      'settings-block',
      'history-tab', 'private-window-tab', 'settings-tab',
      'mode-button-block',
      'mode-button-title', 'pan-cursor-button', 'pan-cursor-button-block',
      'pan-cursor-banner-message',
      'zoom-banner-message-block', 'zoom-banner-message',
      'loading-icon',
      //'tooltip-block',
      'bookmark-button-anime', 'show-bookmarks-button-anime'
    ];

    // Loop and add element with camel style name to Modal Dialog attribute.
    elementIDs.forEach(function createElementRef(name) {
      this[this.toCamelCase(name)] = document.getElementById(name);
    }, this);
  },

  /**
   * handle event
   */
  handleEvent: function toolbar_handleEvent(ev) {
    switch(ev.type) {
      case 'click':
        if(ev.target != this.menuButtonBlock) {
          this.toolbarPanel.dataset.menu = 'hide';
        }

        // Settings in the display
        if(Settings.isDisplayed()) {
          switch(ev.target) {
            case this.backButtonBlock:
            case this.forwardButtonBlock:
            case this.addressForm:
            case this.urlInput:
            case this.addressButton:
            case this.searchForm:
            case this.searchInput:
            case this.searchButton:
            case this.bookmarkButtonBlock:
            case this.showBookmarksButtonBlock:
            case this.homeButtonBlock:
            case this.zoomButtonBlock:
            case this.tabsButtonBlock:
            case this.menuButtonBlock:
              Settings.hide();
              break;
          }
        }
        break;
      default:
        break;
    }
  },

  /**
   * Specialized processing youtube (zoom)
   */
  checkYoutube: function toolbar_checkYoutube() {
    if(!Browser.currentInfo || !Browser.currentInfo.url) {
      return false;
    }
    var end_pos1 =
      Browser.currentInfo.url.indexOf('https://www.youtube.com', 0);
    var end_pos2 = Browser.currentInfo.url.indexOf('http://www.youtube.com', 0);
    if(end_pos1 < 0 && end_pos2 < 0) {
      return false;
    }
    return true;
  },

  /**
   * Full screen or Screen with submenu
   */
  showHideSidebar: function toolbar_showHideSidebar() {
    this.sidebarButtonBlock.blur();
    // Hide Tooltip
    Tooltip.hide();

    // Fade animation end event handler
    var fade_event = (function() {
      Browser.fadeBase.classList.toggle('fade');
      if(Browser.sideBlock.dataset.sidebar == 'true'){
        // Full screen
        Browser.sideBlock.dataset.sidebar = 'false';
        Browser.mainBlock.dataset.sidebar = 'false';
        // save screen mode
        BrowserDB.updateSetting('full', 'screen_mode');
      }else{
        // Disp side screen
        Browser.sideBlock.dataset.sidebar = 'true';
        Browser.mainBlock.dataset.sidebar = 'true';
        // save screen mode
        BrowserDB.updateSetting('side', 'screen_mode');
      }
      Browser.fadeBase.removeEventListener('transitionend', fade_event, false);
      // Specialized processing youtube (zoom)
      Browser.currentInfo.dom.zoom(Toolbar.getZoomScale());
    });
    // Add fade animantion event
    Browser.fadeBase.addEventListener('transitionend', fade_event, false);
    Browser.fadeBase.classList.toggle('fade');
    this.sidebarButtonBlock.dataset.fade='true';
  },

  handleSidebarButtonKeydown: function toolbar_handleSidebarButtonKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      ev.target.classList.add('tapped');
      this.showHideSidebar();
      this.sidebarButtonBlock.dataset.fade='false';
      this.sidebarButtonBlock.focus();
    }
  },

  handleSidebarButtonKeyup: function toolbar_handleSidebarButtonKeyup(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      ev.target.classList.remove('tapped');
    }
  },

  /**
   * Go back to the previous page
   */
  goBack: function toolbar_goBack() {

    if (Awesomescreen.isDisplayedDefault()){
      Awesomescreen.defaultContentViewReturnFunc();
      return;
    }

    if (!Browser.currentInfo.dom.getCanGoBack){
      return;
    }

    Browser.currentInfo.dom.getCanGoBack().onsuccess = (function(ev) {
      if(!ev.target.result){
        BrowserDialog.createDialog('exit_browser', null).then(
          () => {
            window.close();
          },
          () => {
            if (Awesomescreen.isDisplayedDefault()) {
              Toolbar.backButtonBlock.focus();
            }
          });
        return;
      }
    }).bind(this);

    Browser.currentInfo.dom.goBack();
  },

  handleBackButtonKeydown: function toolbar_handleBackButtonKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      this.goBack();
    }
  },

  /**
    * Go forward to the next page
    */
  goForward: function toolbar_goForward() {
    Browser.currentInfo.dom.goForward();
  },

  // Set url form input
  setUrlBar: function toolbar_setUrlBar(value) {
    this.urlInput.value = value;
  },
  // Get url form input
  getUrlFromInput: function toolbar_getUrlFromInput(input) {
    var hasScheme = UrlHelper.hasScheme(input);

    // No scheme, prepend basic protocol and return
    if (!hasScheme) {
      return 'http://' + input;
    }

    return input;
  },
  /**
    * Url form submit
    */
  handleUrlFormSubmit: function toolbar_handleUrlFormSubmit(ev) {
    if (ev) {
      // Can be canceled
      ev.preventDefault();
    }

    if (this.urlButtonMode === null) {
      return;
    }

    var url = this.getUrlFromInput(this.urlInput.value);

    if (url !== Browser.currentInfo.url) {
      this.setUrlBar(url);
      Browser.currentInfo.url = url;
    }

    this.urlInput.blur();

    Browser.navigate(url);
  },

  handleUrlFormKeydown: function toolbar_handleUrlFormKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN && !this.isKeyboardDisplayed) {
      this.showKeyboardOnInput(this.urlInput);
      ev.preventDefault();
    }
  },

  handleUrlFormFocus: function toolbar_handleUrlFormFocus(ev) {
    this.spaceBlock .classList.add('highlight');
  },

  handleUrlFormBlur: function toolbar_handleUrlFormBlur(ev) {
    this.spaceBlock .classList.remove('highlight');
  },

  handleUrlFormMouseLeave: function toolbar_handleUrlFormMouseLeave(ev) {
    // hide the urlInput style when urlInput is focused
    if (document.activeElement !== this.urlInput) {
      this.hideSpaceBlockFocusStyle();
    }
  },

  /**
    * Input Url
    */
  handleUrlInputKeypress: function toolbar_handleUrlInputKeypress(ev) {
    var input = this.urlInput.value;
    if (input === '') {
      this.setUrlButtonMode(null);
      this.addressButton.classList.add('disable');
      return;
    }

    this.addressButton.classList.remove('disable');
    this.setUrlButtonMode(
      UrlHelper.isNotURL(input) ? this.SEARCH : this.GO
    );
  },

  handleUrlInputKeydown: function toolbar_handleUrlInputKeydown(ev) {
    let inputEl = ev.target;
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN && inputEl.readOnly) {
      this.showKeyboardOnInput(inputEl);
      ev.stopPropagation();
      ev.preventDefault();
      return;
    }

    if(SharedUtils.isBackKey(ev)) {
      this.hideKeyboardOnInput(inputEl);
      return;
    }

    if (this.isKeyboardDisplayed) {
      ev.stopPropagation();
      return;
    }
  },

  handleUrlInputClick: function toolbar_handleUrlInputClick(ev) {
    let inputEl = ev.target;
    this.showKeyboardOnInput(inputEl);
  },

  handleUrlInputBlur: function toolbar_handleUrlInputBlur(ev) {
    let inputEl = ev.target;
    if (inputEl.readOnly === false && this.isKeyboardDisplayed) {
      this.hideKeyboardOnInput(inputEl);
    }
    this.hideSpaceBlockFocusStyle();
  },

  /**
    * Address Bookmark Current url
    */
  clickAddressButton: function toolbar_clickAddressButton(ev) {
    //if(this.addressButton.classList.contains('disable')){
      //return;
    //}
    if(this.addressButton.dataset.mode == 'load') {
      if(Browser.currentInfo.url){
        Browser.currentInfo.dom.reload(false);
      }
      this.stopAddressIcon();
    } else {
      Browser.currentInfo.dom.stop();
      this.hiddenLoadingIcon();
      this.loadAddressIcon();
    }
  },

  loadAddressIcon: function toolbar_loadAddressIcon() {
    this.addressButton.dataset.mode = 'load';
    this.addressButton.dataset.tips = 'WB_LT_TIPS_RELOAD';
  },

  stopAddressIcon: function toolbar_stopAddressIcon() {
    this.addressButton.dataset.mode = 'stop';
    this.addressButton.dataset.tips = 'WB_LT_TIPS_STOP_LOADING';
  },

  showLoadingIcon: function toolbar_showLoadingIcon() {
    if(Settings.isDisplayed()) {
      return;
    }
    if(!this.loadingIcon.classList.contains('visible')){
      this.loadingIcon.classList.add('visible');
      this.stopAddressIcon();
    }
  },

  hiddenLoadingIcon: function toolbar_hiddenLoadingIcon() {
    if(Tooltip.isShow(this.addressButton)){
      Tooltip.hide();
    }
    this.loadingIcon.classList.remove('visible');
    this.loadAddressIcon();
  },

  /**
    * Submit search form
    */
  handleSearchFormSubmit: function toolbar_handleSearchFormSubmit(ev) {
    if (ev) {
      // Can be canceled
      ev.preventDefault();
    }

    if( SearchResult.isDisplayed() ) {
      this.searchInput.blur();
      SearchResult.hide();
    }
    var url = Browser.getSearchFromInput(this.searchInput.value);
    Browser.navigate(url);
  },

  handleSearchFormKeydown: function toolbar_handleSearchFormKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN && !this.isKeyboardDisplayed) {
      this.showKeyboardOnInput(this.searchInput);
      ev.preventDefault();
    }
  },

  /**
   * Click search button
   */
  clickSearchButton: function toolbar_clickSearchButton(ev) {
    this.handleSearchFormSubmit(ev);
  },

  handleSearchButtonKeydown: function toolbar_handleSearchButtonKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      this.handleSearchFormSubmit(ev);
    }
  },

  clickSearchClearButton: function toolbar_clickSearchClearButton(ev) {
    if( ev ) {
      ev.preventDefault();
    }
    this.searchInput.value = '';
    SearchResult.resultUpdate(this.searchInput.value);
  },

  handleSearchClearButtonKeydown:
    function toolbar_handleSearchClearButtonKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      ev.target.classList.add('active');
      this.clickSearchClearButton(ev);
      ev.stopPropagation();
    }
  },

  handleSearchClearButtonKeyup:
    function toolbar_handleSearchClearButtonKeyup(ev) {
    ev.target.classList.remove('active');
  },

  handleSearchClearButtonWillmove:
    function toolbar_handleSearchClearButtonWillmove(ev) {
    if (ev.detail.direction === 'left') {
      this.searchInput.focus();
      ev.preventDefault();
    }
  },

  clickSearchCloseButton: function toolbar_clickSearchCloseButton(ev) {
    if( ev ) {
      ev.preventDefault();
    }
    SearchResult.hide();
  },

  handleSearchCloseButtonKeydown:
    function toolbar_handleSearchCloseButtonKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      this.clickSearchCloseButton(ev);
      if (this.searchInput.value) {
        this.searchInput.focus();
      } else {
        this.searchForm.focus();
      }
    }
  },

  handleIconbuttonBlockKeydown:
    function toolbar_handleIconbuttonBlockKeydown(ev) {
    let enableIconButtonIds = [
      'show-bookmarks-button-block',
      'home-button-block',
      'tabs-button-block',
      'menu-button-block'
    ];

    if (ev.keyCode === KeyEvent.DOM_VK_RETURN &&
      enableIconButtonIds.indexOf(ev.target.id) !== -1) {
      ev.target.classList.add('tapped');
    }
  },

  handleIconbuttonBlockKeyup: function toolbar_handleIconbuttonBlockKeyup(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      switch (ev.target.id) {
        case 'show-bookmarks-button-block':
          Awesomescreen.selectBookmarksTab.apply(Awesomescreen);
          ev.target.classList.remove('tapped');
          break;
        case 'home-button-block':
          this.clickHomeButtonBlock(ev);
          ev.target.classList.remove('tapped');
          break;
        case 'tabs-button-block':
          Awesomescreen.handleNewTab.apply(Awesomescreen);
          ev.target.classList.remove('tapped');
          break;
        case 'menu-button-block':
          if (this.toolbarPanel.dataset.menu === 'show') {
            this.toolbarPanel.dataset.menu = 'hide';
          } else {
            this.toolbarPanel.dataset.menu = 'show';
          }
          ev.target.classList.remove('tapped');
          break;
        default:
          break;
      }
    }
  },

  /**
    * Input Search
    */
  getSearchBarStyle: function toolbar_getSearchBarStyle() {
    return this.toolbarPanel.dataset.search;
  },

  setSearchBarStyle: function toolbar_setSearchBarStyle(value) {
    this.toolbarPanel.dataset.search = value;
  },

  handleSearchInputInput: function toolbar_handleSearchInputInput(ev) {
    this.handleSearchInputKeypress(ev);
  },

  handleSearchInputKeydown: function toolbar_handleSearchInputKeydown(ev) {
    let inputEl = ev.target;
    if (ev.keyCode === KeyEvent.DOM_VK_RETURN && inputEl.readOnly) {
      this.showKeyboardOnInput(inputEl);
      ev.stopPropagation();
      ev.preventDefault();
      return;
    }

    if (SharedUtils.isBackKey(ev)) {
      if (this.isKeyboardDisplayed)  {
        this.hideKeyboardOnInput(inputEl);
      } else {
        this.clickSearchCloseButton(ev);
        this.searchInput.focus();
      }
      return;
    }

    if (this.isKeyboardDisplayed) {
      ev.stopPropagation();
      return;
    }
  },

  handleSearchInputWillmove: function toolbar_handleSearchInputWillmove(ev) {
    if (ev.detail.direction === 'down') {
      let searchResultItem =
        SearchResult.searchResultList.querySelector('.result-item');
      if (searchResultItem) {
        ev.preventDefault();
        searchResultItem.focus();
      }
    }
  },

  handleSearchInputClick: function toolbar_handleSearchInputClick(ev) {
    let inputEl = ev.target;
    this.showKeyboardOnInput(inputEl);
    ev.stopPropagation();
  },

  handleSearchInputBlur: function toolbar_handleSearchInputBlur(ev) {
    let inputEl = ev.target;
    if (inputEl.readOnly === false && this.isKeyboardDisplayed) {
      this.hideKeyboardOnInput(inputEl);
    }
  },

  handleSearchInputKeypress: function toolbar_handleSearchInputKeypress(ev) {
    if( this.getSearchBarStyle() == 'false' ) {
      if( ev ) {
        ev.preventDefault();
      }
      if(Toolbar.searchInput.value) {
        Tooltip.hide();
        this.setSearchBarStyle('true');
        SearchResult.show();
      }
    } else {
      SearchResult.handleSearchResultFormInput(ev);
    }
  },

  /**
   * Click home button
   */
  clickHomeButtonBlock: function toolbar_clickHomeButtonBlock(ev) {
    Settings.getHomepage((function(result) {
      if(result) {
        Browser.navigate(result);
      }
    }).bind(this));
  },

  /**
   * Click zoom button
   */
  clickZoomButtonBlock: function toolbar_clickZoomButtonBlock(ev) {
    if(ev){
      // stop event
      ev.stopPropagation();
    }
    clearTimeout(this.showZoomBannerTimeoutID);

    this.zoomScale = Browser.currentInfo.zoom;
    this.zoomScale++;
    if(this.zoomScale >= this.availableZoomScale.length) {
      this.zoomScale = 0;
    }
    Browser.currentInfo.zoom = this.zoomScale;
    Browser.currentInfo.dom.zoom(this.getZoomScale());

    this.zoomBannerMessage.innerHTML =
        this.availableZoomScale[this.zoomScale].disp;
    if(!this.zoomBannerMessageBlock.classList.contains('visible')){
      this.zoomBannerMessageBlock.classList.add('visible');
    }
    this.showZoomBannerTimeoutID = setTimeout(function(){
      Toolbar.zoomBannerMessageBlock.classList.remove('visible');
    }, 1500);
  },
  getZoomScale: function toolbar_getZoomScale() {
    if(this.checkYoutube() && Browser.sideBlock.dataset.sidebar == 'false'){
      return this.availableZoomScaleYoutube[this.zoomScale].scale;
    } else {
      return this.availableZoomScale[this.zoomScale].scale;
    }
  },
  setZoomScale: function toolbar_setZoomScale(scale) {
    this.zoomScale = scale;
  },
  getDefaultZoomScale: function toolbar_getDefaultZoomScale() {
    if(this.checkYoutube() && Browser.sideBlock.dataset.sidebar == 'false'){
      return this.availableZoomScaleYoutube[this.defaultZoomScale].scale;
    } else {
      return this.availableZoomScale[this.defaultZoomScale].scale;
    }
  },
  /**
   * Zoom out(for ars)
   */
  zoomOut: function toolbar_zoomOut() {
    clearTimeout(this.showZoomBannerTimeoutID);

    this.zoomScale = Browser.currentInfo.zoom;
    if(this.zoomScale === 0) {
      return;
    }

    this.zoomScale--;
    Browser.currentInfo.zoom = this.zoomScale;
    Browser.currentInfo.dom.zoom(this.getZoomScale());

    this.zoomBannerMessage.innerHTML =
        this.availableZoomScale[this.zoomScale].disp;
    if(!this.zoomBannerMessageBlock.classList.contains('visible')){
      this.zoomBannerMessageBlock.classList.add('visible');
    }
    this.showZoomBannerTimeoutID = setTimeout(function(){
      Toolbar.zoomBannerMessageBlock.classList.remove('visible');
    }, 1500);
  },

  handleTabButtonBlockWillmove:
    function toolbar_handleTabButtonBlockWillmove(ev) {
      // Close menu list when focus leave menu-button to
      // the left
      if (ev.detail.direction === 'right' ) {
        this.clickMenuButtonBlock(ev);
      }
  },

  /**
   * Click menu button
   */
  clickMenuButtonBlock: function toolbar_clickMenuButtonBlock(ev) {
    if(ev){
      // stop event
      ev.stopPropagation();
    }
    if(this.toolbarPanel.dataset.menu == 'show') {
      this.toolbarPanel.dataset.menu = 'hide';
    } else {
      this.toolbarPanel.dataset.menu = 'show';
      if(!this.menuBlock.style.minWidth) {
        var ar = [];
        // rate 1.25
        ar.push(432); // default 432(540 / 1.25)
        ar.push(this.historyTab.offsetWidth);
        ar.push(this.privateWindowTab.offsetWidth);

        ar.push(this.settingsTab.offsetWidth);
        this.menuBlock.style.minWidth =
          (Math.max.apply(null, ar) * 1.25) + 'px';
      }
    }
  },

  handleMenuButtonBlockWillfocus:
    function toolbar_handleMenuButtonBlockWillfocus(ev) {
    let activeEl = document.activeElement;
    if (activeEl.id === 'tabs-button-block') {
      this.clickMenuButtonBlock(ev);
    }
  },

  handleMenuButtonBlockWillmove:
    function toolbar_handleMenuButtonBlockWillmove(ev) {
      // Close menu list when focus leave menu-button to
      // the left
      if (ev.detail.direction === 'left' &&
        this.toolbarPanel.dataset.menu == 'show') {
        this.toolbarPanel.dataset.menu = 'hide';
      }
  },

  handleMenuBlockKeydown: function toolbar_handleMenuBlockKeydown(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_LEFT) {
      ev.stopPropagation();
      return;
    }
  },

  handleMenuBlockKeyup: function toolbar_handleMenuBlockKeyup(ev) {
    if (ev.keyCode === KeyEvent.DOM_VK_LEFT) {
      ev.stopPropagation();
      ev.preventDefault();
      return;
    }

    if (ev.keyCode === KeyEvent.DOM_VK_RETURN) {
      switch (ev.target.id) {
        case 'history-block':
          Awesomescreen.selectHistoryTab.apply(Awesomescreen);
          break;
        case 'private-window-block':
          Browser.handlePrivateBrowsing.apply(Browser);
          break;
        case 'settings-block':
          Settings.show.apply(Settings);
          break;
        default:
          break;
      }

      this.toolbarPanel.dataset.menu = 'hide';
    }
  },

  /**
   * Show mode button
   */
  showModeButtonTimer: function toolbar_showModeButtonTimer() {
    this.showModeButtonTimeoutID = setTimeout(function(){
      Toolbar.modeButtonBlock.classList.remove('visible');
    }, 5000);
  },

  /**
   * Show mode button
   */
  showPanCursorButton: function toolbar_showPanCursorButton() {
    if(!this.modeButtonBlock.classList.contains('visible')){
      this.modeButtonBlock.classList.add('visible');
      this.showModeButtonTimer();
    }
  },

  /**
   * Selected mode button
   */
  selectedModeButtonBlock: function toolbar_selectedModeButtonBlock() {
    clearTimeout(this.showModeButtonTimeoutID);
  },

  /**
   * Unselected mode button
   */
  unselectedModeButtonBlock: function toolbar_unselectedModeButtonBlock() {
    this.showModeButtonTimer();
  },

  /**
   * Show pan cursor banner
   */
  showPanCursorBanner: function toolbar_showPanCursorBanner() {
    if(!this.panCursorBannerMessage.classList.contains('visible')){
      this.panCursorBannerMessage.classList.add('visible');
    }
    clearTimeout(this.showPanCursorBannerTimeoutID);
    this.showPanCursorBannerTimeoutID = setTimeout(function(){
      Toolbar.panCursorBannerMessage.classList.remove('visible');
    }, 5000);
  },

  /**
   * Click mode button
   */
  clickModeButtonBlock: function toolbar_clickModeButtonBlock() {
    if(Browser.getCursorPanMode() == 'cursor') {
      Browser.setCursorPanMode('pan');
      this.modeButtonTitle.setAttribute('data-l10n-id', 'WB_LT_PAN_MODE');
      this.panCursorBannerMessage.setAttribute(
        'data-l10n-id', 'WB_LT_SWITCH_PAN_MODE');
    } else {
      this.clearDragMode();
    }

    // Show mode button
    this.showPanCursorButton();
    // Show pan cursor banner
    this.showPanCursorBanner();
  },
  // clear drag mode
  clearDragMode: function toolbar_clearDragMode(){
    if(Browser.getCursorPanMode() == 'pan') {
      Browser.setCursorPanMode('cursor');
      this.modeButtonTitle.setAttribute('data-l10n-id', 'WB_LT_CURSOR_MODE');
      this.panCursorBannerMessage.setAttribute(
        'data-l10n-id', 'WB_LT_SWITCH_CURSOR_MODE');
    }
  },

  setUrlButtonMode: function toolbar_setUrlButtonMode(mode) {
    this.urlButtonMode = mode;
  },

  setPrivateBrowsing: function toolbar_setPrivateBrowsing(bool) {
    this.toolbarPanel.dataset.pvt = bool;
  },

  isPrivateBrowsing: function toolbar_getPrivateBrowsing() {
    return (this.toolbarPanel.dataset.pvt == 'true');
  },

  initStartBrowsing: function toolbar_initStartBrowsing() {
    if(this.initStart) {
      this.initStart = false;
      /* show pan cursor mode button */
      this.showPanCursorButton();
    }
  },

  setToolbarMode: function toolbar_setToolbarMode(mode) {
    this.toolbarPanel.dataset.mode = mode;
  },
  getToolbarMode: function toolbar_getToolbarMode() {
    return this.toolbarPanel.dataset.mode;
  },

  showKeyboardOnInput(el) {
    el.readOnly = false;
    el.blur();
    el.focus();
    this.isKeyboardDisplayed = true;
  },

  hideKeyboardOnInput(el) {
    el.readOnly = true;
    el.blur();
    el.focus();
    this.isKeyboardDisplayed = false;
  },

  showSpaceBlockFocusStyle() {
    this.spaceBlock.classList.add('url-input-focus');
  },

  hideSpaceBlockFocusStyle() {
    this.spaceBlock.classList.remove('url-input-focus');
  },
};


