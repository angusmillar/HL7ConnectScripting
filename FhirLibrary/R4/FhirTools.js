function FhirTools() {

  this.PreFixUuid = function (Uuid) {
    return "urn:uuid:" + Uuid;
  };

  this.PathCombine = function (pathArray, delimiter) {
    path = "";
    if (delimiter == undefined || null)
      delimiter = "/";
    for (var i = 0; (i < pathArray.length); i++) {
      if (i == 0) {
        path = pathArray[i];
      } else {
        path = path + "/" + pathArray[i];
      }
    }
    return path;
  }

  this.GetGuid = function () {
    return GUID().toLowerCase();
  };

  this.GetBool = function (bool) {
    if (bool) {
      return "true";
    } else {
      return "false";
    }
  };

  this.SetFhir = function (value) {
    if (value == null) {
      return undefined;
    } else {
      return value
    }
  };

  this.GetRelativeReference = function (ResourceName, ResourceId) {
    return ResourceName + "/" + ResourceId;
  }
  this.GetContainedReference = function (ResourceId) {
    return "#" + ResourceId;
  }

  this.SetTimeZone = function (dateString) {
    if (dateString !== null) {
      var now = new Date;
      var zone = -(now.getTimezoneOffset() / 60);
      //Asumes posative zone as all australian are, now great.
      return dateString + "+" + zone + ":" + "00";
    } else {
      return null;
    }
  }

  this.RemoveTimeFromDataTimeString = function (dateTimeString) {
    if (dateTimeString == null || dateTimeString == undefined) {
      return dateTimeString;
    }
    var split = dateTimeString.split("T");
    if (split.length > 0) {
      return split[0];
    } else {
      return dateTimeString;
    }
  }

  this.FormattedHumanName = function (Family, Given, Title) {
    if (IsSet(Title) && IsSet(Given) && IsSet(Family)) {
      return Family.toUpperCase() + ", " + Title + " " + Given;
    } else if (!IsSet(Title) && IsSet(Given) && IsSet(Family)) {
      return Family.toUpperCase() + ", " + Given;
    } else if (!IsSet(Title) && !IsSet(Given) && IsSet(Family)) {
      return Family.toUpperCase();
    } else {
      return undefined;
    }
  }

  this.FormattedAddress = function (LineOne, LineTwo, Suburb, PostCode, State) {
    var FormattedAddress = undefined;
    if (IsSet(LineOne)) {
      FormattedAddress = LineOne;
    }
    if (IsSet(LineTwo)) {
      FormattedAddress = FormattedAddress + ", " + LineTwo;
    }
    if (IsSet(Suburb)) {
      FormattedAddress = FormattedAddress + ", " + Suburb;
    }
    if (IsSet(PostCode)) {
      FormattedAddress = FormattedAddress + " " + PostCode;
    }
    if (IsSet(State)) {
      FormattedAddress = FormattedAddress + " " + State;
    }
    return FormattedAddress;
  }

  function IsSet(value) {
    if (value == undefined || value == null) {
      return false;
    } else {
      return true;
    }
  }

  this.GetNow = function () {
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    var now = new Date;
    var zone = -(now.getTimezoneOffset() / 60);
    return now.getFullYear() +
      '-' + pad(now.getMonth() + 1) +
      '-' + pad(now.getDate()) +
      'T' + pad(now.getHours()) +
      ':' + pad(now.getMinutes()) +
      ':' + pad(now.getSeconds()) +
      '.' + (now.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      "+" + zone + ":" + "00";
  };

}