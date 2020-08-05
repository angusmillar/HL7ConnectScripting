
function ProcedureRequestFhirResource() {
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "ProcedureRequest";

  Resource.SetIdentifierArray = function (identifierArray) {
    Resource.identifier = FhirTool.SetFhir(identifierArray);
  };

  Resource.SetStatus = function (code) {
    Resource.status = FhirTool.SetFhir(code);
  };

  Resource.SetIntent = function (code) {
    Resource.intent = FhirTool.SetFhir(code);
  };

  Resource.SetSubject = function (reference) {
    Resource.subject = FhirTool.SetFhir(reference);
  };

  Resource.SetRequester = function (referenceAgent, referenceOnBehalfOf) {
    Resource.requester = GetRequester(referenceAgent, referenceOnBehalfOf);
  };

  function GetRequester(referenceAgent, referenceOnBehalfOf) {
    var Requester = new function () { };
    Requester.agent = FhirTool.SetFhir(referenceAgent);
    Requester.onBehalfOf = FhirTool.SetFhir(referenceOnBehalfOf);
    return Requester;
  }

  return Resource;
}