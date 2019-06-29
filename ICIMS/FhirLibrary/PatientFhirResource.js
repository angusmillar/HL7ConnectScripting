
function PatientFhirResource(id){

  var FhirTool = new FhirTools();
  var Resource = new function(){};
  Resource.resourceType = "Patient";
  Resource.id = id;

  this.GetResource = function(){
    return Resource;
  };

  this.SetIdentifierArray = function(identifierArray){
    Resource.identifier = identifierArray;
  };

  this.SetActive = function(bool){
    Resource.active = FhirTool.GetBool(bool);
  };

  this.SetIdentifier = function(identifierArray){
    Resource.identifier = identifierArray;
  };

  this.SetName = function(humanNameArray){
    Resource.name = humanNameArray;
  };

  this.SetGender = function(code){
    Resource.gender = code;
  };

  this.SetBirthDate = function(date){
    Resource.date = date;
  };

  this.SetAddress = function(addressArray){
    Resource.address = addressArray;
  };


}