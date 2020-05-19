function StringSupport() {

  //RemoveWhiteSpace, eg. "Hel  lo Wo  rld" will equal "HelloWorld"
  this.RemoveWhiteSpace = function (value) {
    if (value == undefined || value == null) {
      return value;
    } else {
      return value.split(' ').join('');
    }
  }

  this.XMLEscape = function (item) {
    return item.replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&/g, "&amp;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}