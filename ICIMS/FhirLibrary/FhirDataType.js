function FhirDataType(){

  this.GetCoding = function(code, codeSystem, display, version)
  {
    Coding = new Coding(code, codeSystem, display, version);
    return Coding;
  };
  
  function Coding(code, codeSystem, display, version){
    var coding = new function(){};
    coding.code = code;
    coding.system = codeSystem;
    coding.display = display;
    if (version != "")
      coding.version = version;
    return coding;
  }
  
}