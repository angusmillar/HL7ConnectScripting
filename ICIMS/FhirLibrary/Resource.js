
function Resource(){

//  var Res = new function(){};

//  this.GetResource = function(){
//    return Res;
//  };

  this.SetId = function(id){
    this.id = id;
  };

  this.SetMeta = function(oMeta){
    this.meta = oMeta;
  };

  this.SetMetaProfile = function(urlArray){
    if (typeof this.meta !== 'undefined'){
      this.meta.profile = urlArray;
    } else {
      var FhirDataType = new FhirDataTypeTool();
      this.meta = FhirDataType.GetMeta(undefined, undefined, urlArray, undefined, undefined);
    }
  };

  this.SetImplicitRules = function(uri){
    this.implicitRules = uri;
  };

  this.SetLanguage = function(oCode){
    this.language = oCode;
  };

}