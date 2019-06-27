
<%include $repo$\ICIMS\FhirLibrary\FhirDataTypeTool.js%>

function MessageHeaderFhirResource(id, oModels){
  var oModels = oModels;
  var Resource = new function(){};
  Resource.resourceType = "MessageHeader";
  Resource.id = id;
  var DataType = new FhirDataTypeTool();
  Resource.event = DataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
  Resource.destination = GetDestination("ICIMS", oModels.FacilityConfig.EndPoint);
  Resource.timestamp = oModels.Pathology.Meta.MessageDateTime.AsXML;
  
  this.GetResource = function(){
    return Resource;
  };
  
  this.SetReceiver = function(endpoint, name){
    Resource.receiver = DataType.GetReference(endpoint, name);
  };
  
  this.SetSender = function(endpoint, name){
    Resource.sender = DataType.GetReference(endpoint, name);
  };
  
  this.SetSource = function(name, software, version, oContact, endpoint){
    Resource.source = GetSource(name, software, version, oContact, endpoint);
  };
  
  this.SetFocus = function(endpoint, name){
    Resource.focus = DataType.GetReference(endpoint, name);
  };
  
  function GetDestination(name, endpoint)
  {
    var Destination = new function(){};
    if (name != "")
      Destination.name = name;
    if (endpoint != "")
      Destination.endpoint = endpoint;
    return Destination;
  }
  
  function GetSource(name, software, version, oContact, endpoint)
  {
    var Source = new function(){};
    if (name != "")
      Source.name = name;
      
    if (software != "")
      Source.endpoint = software;
      
    if (version != "")
      Source.endpoint = version;
      
    if (oContact != "")
      Source.endpoint = oContact;

    if (endpoint != "")
      Source.endpoint = endpoint;

    return Source;
  }
  
  
}