
function DiagnosticReportFhirResource() {
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "DiagnosticReport";

  Resource.SetIdentifierArray = function (identifierArray) {
    Resource.identifier = FhirTool.SetFhir(identifierArray);
  };

  Resource.SetStatus = function (code) {
    Resource.status = FhirTool.SetFhir(code);
  };

  Resource.SetCategory = function (codableConcept) {
    Resource.category = FhirTool.SetFhir(codableConcept);
  };

  Resource.SetCode = function (codableConcept) {
    Resource.code = FhirTool.SetFhir(codableConcept);
  };

  Resource.SetSubject = function (reference) {
    Resource.subject = FhirTool.SetFhir(reference);
  };

  Resource.SetEffectiveDateTime = function (dateTime) {
    Resource.effectiveDateTime = FhirTool.SetFhir(dateTime);
  };

  Resource.SetIssued = function (dateTime) {
    Resource.issued = FhirTool.SetFhir(dateTime);
  };

  Resource.AddPerformer = function (oRoleCodableConcept, oActorPractitionerReference) {
    if (Resource.performer == undefined) {
      Resource.performer = [];
    }
    Resource.performer.push(GetPerformer(oRoleCodableConcept, oActorPractitionerReference));
  };

  function GetPerformer(oRoleCodableConcept, oActorPractitionerReference) {
    var Performer = new function () { };
    Performer.role = FhirTool.SetFhir(oRoleCodableConcept);
    Performer.actor = FhirTool.SetFhir(oActorPractitionerReference);
    return Performer;
  }

  Resource.SetResult = function (resultReferenceArray) {
    Resource.result = FhirTool.SetFhir(resultReferenceArray);
  };

  Resource.SetPresentedForm = function (AttachmentArray) {
    Resource.presentedForm = FhirTool.SetFhir(AttachmentArray);
  };

  return Resource

}