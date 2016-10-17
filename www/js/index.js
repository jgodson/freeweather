/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize : function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents : function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener('resume', this.onResume, false);
    document.getElementById('settings-arrow').addEventListener('touchstart', appEvents.menuOpen, false);
    document.getElementById('app-content').addEventListener('touchstart', this.detectSwipe.startSwipe, false);
    document.getElementById('app-content').addEventListener('touchend', this.detectSwipe.endSwipe, false);
    // Add event listener for each menu item
    var elements = document.getElementsByClassName('setting');
    for (var index = 0; index < elements.length; index++) {
      elements[index].addEventListener('touchstart', appEvents.menuClick, false);
    }
  },
  // deviceready Event Handler
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady : function() {
    // Change iOS status bar to somewhat match loading screen
    if (cordova.platformId != 'android') {
      StatusBar.backgroundColorByHexString("#141414");
    }
    StatusBar.overlaysWebView(false); // Make sure webview doesn't overlap status bar
    view.initialize(); // Populate Views Array with all views (class='view')
    appEvents.ready();
  },

  onResume : function() {
    appEvents.ready();
  },

  detectSwipe : {
    startX: 0,

    startSwipe : function(event) {
      appEvents.menuClose();
      this.startX = event.changedTouches[0].clientX;
    },

    endSwipe : function(event) {
      var endX = event.changedTouches[0].clientX;
      if (Math.abs(this.startX - endX) > 150) {
        appEvents.swipe(this.startX > endX ? 'L' : 'R');
      }
    }
  }
};
