
function ObservationFhirResource(id){

  var Resource = new function(){};
  Resource.resourceType = "Observation";
  Resource.id = id;

  this.GetResource = function(){
    return Resource;
  };

  this.SetIdentifierArray = function(identifierArray){
    Resource.identifier = identifierArray;
  };

  this.SetStatus = function(statusCode){
    Resource.status = statusCode;
  }

  this.SetCategory = function(codeableConceptArray){
    Resource.category = codeableConceptArray;
  }

  this.SetCode = function(codeableConcept){
    Resource.code = codeableConcept;
  }

  this.SetSubject = function(reference){
    Resource.subject = reference;
  }

  this.SetEffectiveDateTime = function(dateTime){
    Resource.effectiveDateTime = dateTime;
  }

  this.SetIssued = function(instant){
    Resource.issued = instant;
  }
  
  this.SetValueString = function(string){
    Resource.valueString = string;
  }

  this.SetValueString = function(string){
    Resource.valueString = string;
  }
  
}