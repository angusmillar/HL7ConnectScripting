function BundleFhirResource() {
  var FhirTool = new FhirTools();
  var Res = new Resource();
  var oFhirConfig = new FhirConfig();

  Res.resourceType = oFhirConfig.ResourceName.Bundle;

  Res.SetType = function (code) {
    Res.type = FhirTool.SetFhir(code);
  };

  Res.AddEntry = function (fullUrl, resource) {
    if (typeof Res.entry == 'undefined') {
      Res.entry = [];
    }
    Res.entry.push(GetEntry(fullUrl, resource));
  }

  function GetEntry(fullURL, resource) {
    var Entry = new function () { };
    Entry.fullUrl = FhirTool.SetFhir(fullURL);
    Entry.resource = FhirTool.SetFhir(resource);
    return Entry;
  }

  return Res;
}