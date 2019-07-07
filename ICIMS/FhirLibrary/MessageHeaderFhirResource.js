
function MessageHeaderFhirResource(){
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "MessageHeader";

  Resource.SetEvent = function(oCoding){
    Resource.event = FhirTool.SetFhir(oCoding);
  };

  Resource.SetDestination = function(nameString, oTargetReference, endpointUri){
    Resource.destination = GetDestination(nameString, oTargetReference, endpointUri);
  };

  Resource.SetTimestamp = function(instant){
    Resource.timestamp = FhirTool.SetFhir(instant);
  };

  Resource.SetReceiver = function(oReferece){
    Resource.receiver = FhirTool.SetFhir(oReferece);
  };

  Resource.SetSender = function(oReferece){
    Resource.sender =  FhirTool.SetFhir(oReferece);
  };

  Resource.SetSource = function(name, software, version, oContact, endpoint){
    Resource.source = GetSource(name, software, version, oContact, endpoint);
  };
  
  Resource.SetFocus = function(oReferece){
    Resource.focus = FhirTool.SetFhir(oReferece);
  };

  function GetDestination(nameString, oTargetReference, endpointUri)
  {
    var Destination = new function(){};
    Destination.name = FhirTool.SetFhir(nameString);
    Destination.reference = FhirTool.SetFhir(oTargetReference);
    Destination.endpoint = FhirTool.SetFhir(endpointUri);
    return Destination;
  }

  function GetSource(name, software, version, oContact, endpoint)
  {
    var Source = new function(){};
    Source.name = FhirTool.SetFhir(name);
    Source.endpoint = FhirTool.SetFhir(software);
    Source.endpoint = FhirTool.SetFhir(version);
    Source.endpoint = FhirTool.SetFhir(oContact);
    Source.endpoint = FhirTool.SetFhir(endpoint);
    return Source;
  }

  return Resource;

}