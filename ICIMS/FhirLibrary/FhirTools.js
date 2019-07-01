function FhirTools(){

  this.PreFixUuid = function(Uuid)
  {
    return "urn:uuid:" + Uuid;
  };

  this.GetGuid = function()
  {
    return GUID().toLowerCase();
  };

  this.GetBool = function(bool)
  {
    if (bool){
      return "true";
    } else {
      return "false";
    }
  };

  this.SetTimeZone = function(dateString){
    var now = new Date;
    var zone = -(now.getTimezoneOffset() / 60);
    //Asumes posative zone as all australian are, now great.
    return dateString + "+" + zone + ":" + "00";
  }

  this.GetNow = function(){
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