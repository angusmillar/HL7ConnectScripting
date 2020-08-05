
function MessageHeaderFhirResource() {
  var FhirTool = new FhirTools();
  var oFhirConfig = new FhirConfig();
  var Resource = new DomainResource();

  Resource.resourceType = oFhirConfig.ResourceName.MessageHeader;

  Resource.SetEventCoding = function (oCoding) {
    Resource.eventCoding = FhirTool.SetFhir(oCoding);
  };

  Resource.SetEventUri = function (Uri) {
    Resource.eventUri = FhirTool.SetFhir(Uri);
  };

  Resource.SetDestination = function (nameString, oTargetReference, endpointUri, oReceiverReference) {
    Resource.destination = GetDestination(nameString, oTargetReference, endpointUri, oReceiverReference);
  };

  Resource.SetSender = function (oReferece) {
    Resource.sender = FhirTool.SetFhir(oReferece);
  };

  Resource.SetEnterer = function (oReferece) {
    Resource.enterer = FhirTool.SetFhir(oReferece);
  };

  Resource.SetAuthor = function (oReferece) {
    Resource.author = FhirTool.SetFhir(oReferece);
  };

  Resource.SetSource = function (name, software, version, oContact, endpoint) {
    Resource.source = GetSource(name, software, version, oContact, endpoint);
  };

  Resource.SetFocus = function (oReferece) {
    Resource.focus = FhirTool.SetFhir(oReferece);
  };

  function GetDestination(nameString, oTargetReference, endpointUri, oReceiverReference) {
    var Destination = new function () { };
    Destination.name = FhirTool.SetFhir(nameString);
    Destination.target = FhirTool.SetFhir(oTargetReference);
    Destination.endpoint = FhirTool.SetFhir(endpointUri);
    Destination.receiver = FhirTool.SetFhir(oReceiverReference);
    return Destination;
  }

  function GetSource(name, software, version, oContact, endpoint) {
    var Source = new function () { };
    Source.name = FhirTool.SetFhir(name);
    Source.endpoint = FhirTool.SetFhir(software);
    Source.endpoint = FhirTool.SetFhir(version);
    Source.endpoint = FhirTool.SetFhir(oContact);
    Source.endpoint = FhirTool.SetFhir(endpoint);
    return Source;
  }

  return Resource;

}