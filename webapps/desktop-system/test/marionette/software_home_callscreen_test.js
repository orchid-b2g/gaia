'use strict';
var FakeDialerApp = require('./lib/fakedialerapp.js');

marionette('Software Home Button - Call screen Appearance', function() {
  var apps = {};
  apps[FakeDialerApp.DEFAULT_ORIGIN] = __dirname + '/../webapps/fakedialerapp';

  var client = marionette.client({
    profile: {
      prefs: {
        'focusmanager.testmode': true
      },
      settings: {
        'software-button.enabled': true
      },
      apps: apps
    }
  });
  var system;
  var fakedialer;

  setup(function() {
    system = client.loader.getAppClass('system');
    system.waitForFullyLoaded();

    fakedialer = new FakeDialerApp(client);
  });

  test('Call screen height should leave room for the SHB', function() {
    fakedialer.launch();
    fakedialer.waitForTitleShown(true);
    client.switchToFrame();

    function rect(el) {
      return el.getBoundingClientRect();
    }

    var winHeight = client.findElement('body').size().height;
    client.waitFor(function() {
      var attentionWindow =
        client.helper.waitForElement('.attentionWindow.active');
      var attentionWindowRect = attentionWindow.scriptWith(rect);
      var shbRect = system.softwareButtons.scriptWith(rect);

      return attentionWindowRect.bottom === shbRect.top &&
        winHeight === (attentionWindowRect.height + shbRect.height);
    });
  });
});
