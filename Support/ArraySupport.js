function ArraySupport() {

  //returns a new array of objects filtered from the source array
  //where the prop == value
  this.Filter = function (arr, prop, value) {
    var result = [];
    var o;
    for (var i = 0, iLen = arr.length; i < iLen; i++) {
      o = arr[i];
      for (var p in o) {
        if (o.hasOwnProperty(p) && p == prop && o[p] == value) {
          result.push(o);
        }
      }
    }
    return result;
  }

  //return the first single object from the source array
  //where the prop == value, or null if none found.
  this.Find = function (arr, prop, value) {
    var o;
    for (var i = 0, iLen = arr.length; i < iLen; i++) {
      o = arr[i];
      for (var p in o) {
        if (o.hasOwnProperty(p) && p == prop && o[p] == value) {
          return o;
        }
      }
    }
    return null;
  }

  //Return True is the Value is found in the array. Used for simple array such as ["a", "b", "c"]
  // not for arrays of objects  
  this.Contains = function (arr, value) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return true;
      }
    }
    return false;
  }

}