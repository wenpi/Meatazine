jQuery.namespace('Meatazine.utils');
Meatazine.utils.FileReferrence = new function () {
  var self = this,
      reader = new FileReader(),
      targetFile,
      fileName,
      fileSystem,
      fileContent,
      fileURL;
  this.clone = function (file) {
    if (file == null) {
      throw new Error('文件错误');
    }
    if (file.fileSize > 10 * 1024 * 1024) {
      throw new Error('不能使用超过10M的素材');
    }
    if (file.type.match(/image/) == null) {
      throw new Error('只能上传图片类素材');
    }
    targetFile = file;
    fileSystem.root.getFile(file.name, {create: true}, fileEntry_cloneReadyHandler, errorHandler);
  }
  this.read = function (url) {
    window.webkitResolveLocalFileSystemURL(url, fileEntry_readReadyHandler);
  }
  this.save = function (name, content) {
    fileName = name;
    fileContent = content;
    fileSystem.root.getFile(fileName, {create: true, exclusive: true}, fileEntry_saveReadyHandler, errorHandler);
  }
  function fileSystemReadyHandler(fs) {
    fileSystem = fs;
  }
  function fileEntry_cloneReadyHandler(fileEntry) {
    fileURL = fileEntry.toURL();
    fileEntry.createWriter(fileWriter_cloneReadyHandler, errorHandler);
  }
  function fileEntry_readReadyHandler(fileEntry) {
    fileEntry.file(fileReadyHandler, errorHandler);
  }
  function fileEntry_saveReadyHandler(fileEntry) {
    fileURL = fileEntry.toURL();
    fileEntry.createWriter(fileWriter_saveReadyHandler, errorHandler);
  }
  function fileEntry_removeReadyHandler(fileEntry) {
    fileEntry.remove(fileRemoveHandler, errorHandler);
  }
  function fileWriter_cloneReadyHandler(fileWriter) {
    fileWriter.onwriteend = function(e) {
      console.log('Write completed.');
      self.trigger('complete:clone', fileURL);
    };
    fileWriter.onerror = function(e) {
      console.log('Write failed: ' + e.toString());
    };
    fileWriter.write(targetFile);
    targetFile = null;
  }
  function fileWriter_saveReadyHandler(fileWriter) {
    fileWriter.onwriteend = function (event) {
      console.log('Write completed.');
      self.trigger('complete:save', fileURL);
    };
    fileWriter.onerror = function (error) {
      console.log('Write failed: ' + error.toString());
    };
    var bb = new WebKitBlobBuilder();
    bb.append(fileContent);
    fileWriter.write(bb.getBlob('text/plain'));
    fileContent = null;
  }
  function fileReadyHandler(file) {
    reader.readAsBinaryString(file);
  }
  function fileRemoveHandler() {
    console.log('Removed: ' + fileName);
    self.save(fileName, fileContent);
  }
  function errorHandler(error) {
    console.log('Error: ' + error.code, Error);
    if (error.code == FileError.INVALID_MODIFICATION_ERR) {
      fileSystem.root.getFile(fileName, {create: false}, fileEntry_removeReadyHandler, errorHandler);
    }
  }
  _.extend(this, Backbone.Events);
  reader.onload = function (event) {
    self.trigger('complete:read', event.target.result);
  }
  window.webkitRequestFileSystem(TEMPORARY, 128 * 1024 * 1024, fileSystemReadyHandler, errorHandler)
}