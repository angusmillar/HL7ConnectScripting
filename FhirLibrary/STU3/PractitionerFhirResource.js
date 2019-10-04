
function PractitionerFhirResource() {
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "Practitioner";

  Resource.SetIdentifierArray = function (identifierArray) {
    Resource.identifier = FhirTool.SetFhir(identifierArray);
  };

  Resource.SetName = function (oHumanNameArray) {
    Resource.name = oHumanNameArray;
  };


  return Resource;
}