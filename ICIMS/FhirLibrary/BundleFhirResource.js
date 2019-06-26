
<%include $repo$\ICIMS\FhirLibrary\MessageHeaderFhirResource.js%>


function BundleFhirResource(){

  this.GetResource = function(oHL7){
    Resource = new CreateResource(oHL7);
    return Resource;
  };

  function CreateResource(oHL7){

    var Bundle = new function(){};
    Bundle.resourceType = "Bundle";
    Bundle.id = GUID();
    Bundle.type = "message";
    
    var MsgHeader = new MessageHeaderFhirResource();
    var MessageHeaderEntry = GetEntry(GUID(),MsgHeader.GetResource(oHL7));
    Bundle.entry = [ MessageHeaderEntry ];
    
    return Bundle;
  }
  
  function GetEntry(fullURL, resource)
  {
    var Entry = new function(){};
    Entry.fullUrl = fullURL;
    Entry.resource = resource;
    return Entry;
  }
}