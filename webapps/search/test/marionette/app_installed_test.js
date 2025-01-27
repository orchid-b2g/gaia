'use strict';

var AppInstall =
  require('../../../../webapps/system/test/marionette/lib/app_install');
var Rocketbar =
  require('../../../system/test/marionette/lib/rocketbar.js');
var createAppServer =
  require('../../../homescreen/test/marionette/server/parent');

marionette('Search - Installed Apps Test', function() {
  var clientOptions = require(__dirname + '/client_options.js');
  var client = marionette.client({
    profile: clientOptions,
    desiredCapabilities: { raisesAccessibilityExceptions: false }
  });
  var appInstall, home, rocketbar, search, server, system;

  setup(function(done) {
    appInstall = new AppInstall(client);
    home = client.loader.getAppClass('homescreen');
    system = client.loader.getAppClass('system');
    search = client.loader.getAppClass('search');
    rocketbar = new Rocketbar(client);
    system.waitForFullyLoaded();

    var app = __dirname + '/fixtures/installed_app';
    createAppServer(app, client, function(err, _server) {
      server = _server;
      done(err);
    });
  });

  test('app result after install/uninstall', function() {
    home.waitForLaunch();
    rocketbar.homescreenFocus();
    rocketbar.enterText('Calendar');
    search.goToResults();

    // Should only have the 'stock' calendar app.
    client.waitFor(function() {
      return search.countGridResults() === 1;
    });

    // Exit rocketbar and install the app.
    client.switchToFrame();
    system.tapHome();
    appInstall.installPackage(server.packageManifestURL);

    // Search again for the same term.
    rocketbar.appTitleFocus();
    rocketbar.enterText('Calendar');
    search.goToResults();

    // Should now contain the newly installed app as well.
    client.waitFor(function() {
      return search.countGridResults() === 2;
    });

    // Remove the installed app.
    client.switchToFrame();
    system.tapHome();
    appInstall.uninstall(server.packageManifestURL);
    home.confirmDialog('remove');

    // Should now contain only a single app.
    rocketbar.appTitleFocus();
    rocketbar.enterText('Calendar');
    search.goToResults();
    client.waitFor(function() {
      return search.countGridResults() === 1;
    });
  });

});
