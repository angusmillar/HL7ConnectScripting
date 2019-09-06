
function DomainResource(){

  var DomainResource = new Resource();

  DomainResource.SetText = function(oNarrative){
    DomainResource.text = oNarrative;
  };

  DomainResource.SetContained = function(oResourceArray){
    DomainResource.contained = oResourceArray;
  };

  DomainResource.SetExtension = function(oExtensionArray){
    DomainResource.extension = oExtensionArray;
  };

  DomainResource.SetModifierExtension = function(oExtensionArray){
    DomainResource.modifierExtension = oExtensionArray;
  };

  return DomainResource;
}