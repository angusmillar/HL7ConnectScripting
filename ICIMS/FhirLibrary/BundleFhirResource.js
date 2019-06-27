function BundleFhirResource(){

  var Bundle = new function(){};
  Bundle.resourceType = "Bundle";
  Bundle.id = GUID();
  Bundle.type = "message";
  Bundle.entry = [];

  this.GetResource = function(){
    return Bundle;
  };

  this.AddEntry = function(fullUrl, resource){
    Bundle.entry.push(GetEntry(fullUrl, resource));
  }

  function GetEntry(fullURL, resource)
  {
    var Entry = new function(){};
    Entry.fullUrl = fullURL;
    Entry.resource = resource;
    return Entry;
  }
}