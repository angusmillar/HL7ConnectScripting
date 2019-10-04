function StringSupport() {

  //RemoveWhiteSpace, eg. "Hel  lo Wo  rld" will equal "HelloWorld"
  this.RemoveWhiteSpace = function (value) {
    if (value == undefined || value == null) {
      return value;
    } else {
      return value.split(' ').join('');
    }
  }
}