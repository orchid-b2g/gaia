'use strict';

var Gallery = require('./lib/gallery.js'),
	  assert = require('assert');

marionette('loading images', function() {

  var app, client;

  client = marionette.client({
    profile: {
      prefs: {
        'device.storage.enabled': true,
        'device.storage.testing': true,
        'device.storage.prompt.testing': true
      }
    }
  });

  setup(function() {
    // Remove all files in temp device storage.
    client.fileManager.removeAllFiles();
    // Add invalid files into the pictures directory
    client.fileManager.add([
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x01.png'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x02.gif'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x03.jpg'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x05.png'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x06.jpg'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x08.jpg'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x09.png'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x10.gif'},
      {type: 'pictures', filePath: 'webapps/gallery/test/images/x11.bmp'}
    ]);
    app = new Gallery(client);
    app.launch(true);
  });

  test('check invalid images are not shown in thumbnail view', function() {
    assert.strictEqual(app.thumbnails.length, 0);

    var overlayView = app.overlayView;
    client.helper.waitForElement(overlayView);
    assert.ok(overlayView.displayed());

    var overlayTitle = app.overlayTitle;
    assert.ok(overlayTitle.displayed());
    assert.ok(overlayTitle.text() == 'No photos or videos');

    var overlayText = app.overlayText;
    assert.ok(overlayText.displayed());
    assert.ok(overlayText.text() == 'Use the Camera app to get started.');

    var cameraButton = app.cameraButton;
    assert.ok(cameraButton.displayed());
    assert.ok(cameraButton.text() == 'Go to Camera');
  });
});
