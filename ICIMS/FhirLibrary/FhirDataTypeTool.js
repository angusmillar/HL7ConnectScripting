function FhirDataTypeTool(){

  this.GetCoding = function(code, codeSystem, display, version)
  {
    return new Coding(code, codeSystem, display, version);
  };

  this.GetReference = function(reference, display)
  {
    return new Reference(reference, display);
  };

  this.GetIdentifier = function(use, oType, system, value, oPeriod, oAssigner)
  {
    return new Identifier(use, oType, system, value, oPeriod, oAssigner);
  };

  this.GetCodeableConcept = function(oCoding, text)
  {
    return new CodeableConcept(oCoding, text);
  };

  this.GetPeriod = function(start, end)
  {
    return new Period(start, end);
  };

  this.GetPdfAttachment = function(base64Data)
  {
    return new Attachment("application/pdf", undefined , base64Data);
  };

  this.GetHumanName = function(use, text, famly, given, prefix, suffix, oPeriod)
  {
    return new HumanName(use, text, famly, given, prefix, suffix, oPeriod);
  };

  this.GetAddress = function(use, type, text, line, city, district, state, postalCode, country, oPeriod)
  {
    return new Address(use, type, text, line, city, district, state, postalCode, country, oPeriod);
  };

  this.GetAddressAustrlian = function(use, text, line, suburb, state, postalCode, country, oPeriod)
  {
    return new Address(use, undefined, text, line, suburb, undefined, state, postalCode, country, oPeriod);
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
  
  function Reference(reference, display){
    var ref = new function(){};
    ref.reference = reference;
    ref.display = display;
    return ref;
  }

  function Identifier(use, oType, system, value, oPeriod, oAssigner){
    var id = new function(){};
    id.use = use;
    id.type = oType;
    id.system = system
    id.value = value
    id.period = oPeriod
    id.assigner = oAssigner
    return id;
  }

  function CodeableConcept(oCoding, text){
    var CodeableConcept = new function(){};
    CodeableConcept.coding = oCoding;
    CodeableConcept.text = text;
    return CodeableConcept;
  }

  function Period(start, end){
    var Period = new function(){};
    Period.start = start;
    Period.end = end;
    return Period;
  }

  function Attachment(contentType, language, data){
    var Attachment = new function(){};
    Attachment.contentType = contentType;
    Attachment.language = language;
    Attachment.data = data;
    return Attachment;
  }

  function HumanName(use, text, family, given, prefix, suffix, oPeriod){
    var HumanName = new function(){};
    HumanName.use = use;
    HumanName.text = text;
    HumanName.family = family;
    HumanName.given = given;
    HumanName.prefix = prefix;
    HumanName.suffix = suffix;
    HumanName.period = oPeriod;
    return HumanName;
  }

  function Address(use, type, text, line, city, district, state, postalCode, country, oPeriod){
    var Address = new function(){};
    Address.use = use;
    Address.type = type;
    Address.text = text;
    Address.line = line;
    Address.city = city;
    Address.district = district;
    Address.state = state;
    Address.postalCode = postalCode;
    Address.country = country;
    Address.period = oPeriod;
    return Address;
  }

}