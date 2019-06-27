function FhirTools(){

  this.PreFixUuid = function(Uuid)
  {
    return "urn:uuid:" + Uuid;
  };

}