function FhirTools(){

  this.PreFixUuid = function(Uuid)
  {
    return "urn:uuid:" + Uuid;
  };

  this.GetGuid = function()
  {
    return GUID().toLowerCase();
  };


}