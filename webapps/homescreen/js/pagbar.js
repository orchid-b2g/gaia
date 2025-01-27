
'use strict';

var PaginationBar = (function() {
  var style, previousTotal, scroller;

  var dir = document.documentElement.dir === 'rtl' ? -1 : 1;

  return {
    /*
     * Initializes the pagination bar
     *
     * @param {String} container that holds the pagination bar
     */
    init: function pb_init(element) {
      scroller = (typeof element == 'object') ?
          element : document.querySelector(element);
      style = scroller.style;
      scroller.addEventListener('keypress', this);
    },

    /*
     * Shows the pagination bar
     */
    show: function pb_show() {
      style.visibility = 'visible';
    },

    /*
     * Hides the pagination bar
     */
    hide: function pb_hide() {
      style.visibility = 'hidden';
    },

    /*
     * Updates the progress of the bar
     *
     * @param {int} current page (start index is zero)
     *
     * @param {int} total number of pages
     */
    update: function pb_update(current, total) {
      scroller.setAttribute('aria-valuenow', current);
      scroller.setAttribute('aria-valuemax', total - 1);
      scroller.setAttribute('aria-valuetext', navigator.mozL10n.get(
        'paginationBarText', {
          current: current + 1,
          total: total
        }));
      if (total && previousTotal !== total) {
        style.width = '1.6rem';
        scroller.parentElement.style.width = (total * 1.2) + 'rem';
        // Force a reflow otherwise the pagination bar is not resized after
        // rebooting the device (see bug 822186)
        scroller.getBoundingClientRect();
        previousTotal = total;
      }

      style.transform = 'translateX(' + current * dir + 'rem)';
    },

    handleEvent: function pb_handleEvent(evt) {
      if (evt.type !== 'keypress' || evt.ctrlKey) {
        return;
      }

      switch (evt.keyCode) {
        case evt.DOM_VK_UP:
          GridManager.goToNextPage();
          break;
        case evt.DOM_VK_DOWN:
          GridManager.goToPreviousPage();
          break;
      }
    }
  };
}());
