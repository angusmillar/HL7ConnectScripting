
function ObservationFhirResource(){
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "Observation";

  Resource.SetIdentifierArray = function(identifierArray){
    Resource.identifier = FhirTool.SetFhir(identifierArray);
  };

  Resource.SetStatus = function(statusCode){
    Resource.status = FhirTool.SetFhir(statusCode);
  }

  Resource.SetCategory = function(codeableConceptArray){
    Resource.category = FhirTool.SetFhir(codeableConceptArray);
  }

  Resource.SetCode = function(codeableConcept){
    Resource.code = FhirTool.SetFhir(codeableConcept);
  }

  Resource.SetSubject = function(reference){
    Resource.subject = FhirTool.SetFhir(reference);
  }

  Resource.SetEffectiveDateTime = function(dateTime){
    Resource.effectiveDateTime = FhirTool.SetFhir(dateTime);
  }

  Resource.SetIssued = function(instant){
    Resource.issued = FhirTool.SetFhir(instant);
  }
  
  Resource.SetValueString = function(string){
    Resource.valueString = FhirTool.SetFhir(string);
  }

  Resource.SetValueString = function(string){
    Resource.valueString = FhirTool.SetFhir(string);
  }
  
  return Resource;
}