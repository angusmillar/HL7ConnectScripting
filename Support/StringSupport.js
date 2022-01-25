function StringSupport() {

  //RemoveWhiteSpace, eg. "Hel  lo Wo  rld" will equal "HelloWorld"
  this.RemoveWhiteSpace = function (value) {
    if (value == undefined || value == null) {
      return value;
    } else {
      return value.split(' ').join('');
    }
  }

  //True is 'item' starts with 'prefix'
  this.StartsWith = function (item, prefix) {
    return item.lastIndexOf(prefix, 0) === 0;
  }

  //True is 'item' ends with 'suffix'
  this.EndsWith = function (item, suffix) {     
    return item.indexOf(suffix, item.length - suffix.length) !== -1;     
  }

  this.XMLEscape = function (item) {
    return item.replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&/g, "&amp;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}