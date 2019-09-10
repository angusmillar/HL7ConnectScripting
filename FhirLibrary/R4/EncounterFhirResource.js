
function EncounterFhirResource() {

  var FhirTool = new FhirTools();
  var Resource = new DomainResource();
  var oFhirConfig = new FhirConfig();

  Resource.resourceType = oFhirConfig.ResourceName.Encounter;

  Resource.SetIdentifier = function (oIdentifierArray) {
    Resource.identifier = oIdentifierArray;
  };

  Resource.SetStatus = function (oCode) {
    Resource.status = oCode;
  };

  Resource.SetClass = function (oCoding) {
    Resource.status = oCoding;
  };

  Resource.SetSubject = function (reference) {
    Resource.subject = FhirTool.SetFhir(reference);
  };

  Resource.SetPeriod = function (oPeriod) {
    Resource.period = FhirTool.SetFhir(oPeriod);
  };

  return Resource;

}