/*
 *  Copyright 2014 TWO SIGMA INVESTMENTS, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * File menu plugin
 * This adds file system specific menu items to the File menu.
 */
(function() {
  'use strict';

  var errorHandler = function(data, status, headers, config) {
    bkHelper.showErrorModal(data);
    bkHelper.refreshRootScope();
  };

  bkHelper.registerSaveFunc("file", function(path, notebookModel) {
    var notebookJson = bkHelper.toPrettyJson(notebookModel);
    return bkHelper.saveFile(path, notebookJson);
  });
  var openURI_filesys = function(path) {
    if (!path) {
      return;
    }
    var load = /^https?:\/\//.exec(path) ? bkHelper.loadHttp : bkHelper.loadFile;
    load(path).then(function(content) {
      var notebookJson = content;
      bkHelper.loadNotebook(notebookJson, true, path);
      bkHelper.setSaveFunction(function(notebookModel) {
        return bkHelper.saveFile(path, bkHelper.toPrettyJson(notebookModel));
      });
      bkHelper.evaluate("initialization");
      document.title = path.replace(/^.*[\\\/]/, '');
    }, errorHandler);
  };
  bkHelper.setPathOpener("file", {
    open: function(url) {
      openURI_filesys(url);
    }
  });

  bkHelper.getHomeDirectory().then(function(homeDir) {
    var toAdd = [
      {
        parent: "File",
        submenu: "Open",
        items: [
          {
            name: "Open... (File)",
            reducedName: "Open...",
            tooltip: "Open a file from file system",
            action: function() {
              bkHelper.showFileChooser(
                  bkHelper.openURI,
                  '<div class="modal-header">' +
                      '   <h1>Open <span ng-show="getStrategy().treeViewfs.showSpinner"><i class="fa fa-refresh fa-spin"></i></span></h1>' +
                      '</div>' +
                      '<div class="modal-body">' +
                      '   <tree-view rooturi="/" fs="getStrategy().treeViewfs"></tree-view>' +
                      '   <tree-view rooturi="' + homeDir + '" fs="getStrategy().treeViewfs"></tree-view>' +
                      '</div>' +
                      '<div class="modal-footer">' +
                      "   <div class='text-left'>Enter a file path (e.g. /Users/...) or URL (e.g. http://...):</div>" +
                      '   <p><input id="openFileInput" class="input-xxlarge" ng-model="getStrategy().result" ng-keypress="getStrategy().close($event, close)" focus-start /></p>' +
                      '   <button ng-click="close()" class="btn">Cancel</button>' +
                      '   <button ng-click="close(getStrategy().result)" class="btn btn-primary">Open</button>' +
                      '</div>', // template
                  bkHelper.getFileSystemChooserStrategy()
              );
            }
          }
        ]
      },
      {
        parent: "File",
        submenu: "Save As",
        items: [
          {
            name: "Save as... (file)",
            reducedName: "Save as...",
            tooltip: "Save a file from file system",
            action: function() {
              var saveAsPath = function(path) {
                if (!path) {
                  return;
                }
                bkHelper.setSaveFunction(function(notebookModel) {
                  var notebookJson = bkHelper.toPrettyJson(notebookModel);
                  return bkHelper.saveFile(path, notebookJson).then(function() {
                    bkHelper.setSaveFunction(function(notebookModel) {
                      return save(path, bkHelper.toPrettyJson(notebookModel));
                    });
                    document.title = path.replace(/^.*[\\\/]/, '');
                  });
                });
                return bkHelper.saveNotebook();
              };
              bkHelper.showFileChooser(
                  saveAsPath,
                  '<div class="modal-header">' +
                      '   <h1>Save <span ng-show="getStrategy().treeViewfs.showSpinner"><i class="fa fa-refresh fa-spin"></i></span></h1>' +
                      '</div>' +
                      '<div class="modal-body">' +
                      '   <tree-view rooturi="/" fs="getStrategy().treeViewfs"></tree-view>' +
                      '   <tree-view rooturi="' + homeDir + '" fs="getStrategy().treeViewfs"></tree-view>' +
                      '</div>' +
                      '<div class="modal-footer">' +
                      '   <p><input id="saveAsFileInput" class="input-xxlarge" ng-model="getStrategy().result" ng-keypress="getStrategy().close($event, close)" focus-start /></p>' +
                      '   <button ng-click="close()" class="btn">Cancel</button>' +
                      '   <button ng-click="close(getStrategy().result)" class="btn btn-primary" >Save</button>' +
                      '</div>', // template
                  bkHelper.getFileSystemChooserStrategy()
              );
            }
          }
        ]
      }
    ];
    pluginObj.onReady(toAdd);
  });
})();
