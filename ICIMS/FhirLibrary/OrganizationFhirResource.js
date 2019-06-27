function OrganizationFhirResource(id, name){

  var Resource = new function(){};
  Resource.resourceType = "Organization";
  Resource.id = id;
  Resource.name = name;
  
  this.GetResource = function(){
    return Resource;
  };
  
  this.SetAlias = function(AliasArray){
    Resource.alias = AliasArray;
  }

  
}