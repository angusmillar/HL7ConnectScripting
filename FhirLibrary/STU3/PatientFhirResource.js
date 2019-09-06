
function PatientFhirResource(){

  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  
  Resource.resourceType = "Patient";

  Resource.SetActive = function(bool){
    Resource.active = FhirTool.GetBool(bool);
  };

  Resource.SetIdentifier = function(oIdentifierArray){
    Resource.identifier = oIdentifierArray;
  };

  Resource.SetName = function(oHumanNameArray){
    Resource.name = oHumanNameArray;
  };

  Resource.SetGender = function(oCode){
    Resource.gender = oCode;
  };

  Resource.SetBirthDate = function(date){
    Resource.birthDate = date;
  };

  Resource.SetAddress = function(oAddressArray){
    Resource.address = oAddressArray;
  };

  return Resource;

}