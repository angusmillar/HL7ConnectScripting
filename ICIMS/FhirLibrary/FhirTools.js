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


}