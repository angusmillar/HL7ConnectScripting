function BundleFhirResource(){
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "Bundle";
  

  Resource.SetType = function(code){
    Resource.type = FhirTool.SetFhir(code);
  };
  
  Resource.AddEntry = function(fullUrl, resource){
    if (typeof Resource.entry == 'undefined'){
      Resource.entry = [];
    }
    Resource.entry.push(GetEntry(fullUrl, resource));
  }

  function GetEntry(fullURL, resource)
  {
    var Entry = new function(){};
    Entry.fullUrl = FhirTool.SetFhir(fullURL);
    Entry.resource = FhirTool.SetFhir(resource);
    return Entry;
  }
  
  return Resource;
}