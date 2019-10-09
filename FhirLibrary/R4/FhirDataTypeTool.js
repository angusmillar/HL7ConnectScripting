
function FhirDataTypeTool() {

  var oFhirTool = new FhirTools();

  this.GetMeta = function (versionId, lastUpdatedInstant, profileUriArray, oSecurityCodingArray, oTagCodingArray) {
    return new Meta(versionId, lastUpdatedInstant, profileUriArray, oSecurityCodingArray, oTagCodingArray);
  };

  this.GetCoding = function (code, codeSystem, display, version) {
    return new Coding(code, codeSystem, display, version);
  };

  this.GetReference = function (reference, typeUri, oIdentifer, display) {
    return new Reference(reference, typeUri, oIdentifer, display);
  };

  this.GetIdentifier = function (use, oType, system, value, oPeriod, oAssigner) {
    return new Identifier(use, oType, system, value, oPeriod, oAssigner);
  };

  this.GetCodeableConcept = function (oCoding, text) {
    return new CodeableConcept(oCoding, text);
  };

  this.GetPeriod = function (start, end) {
    return new Period(start, end);
  };

  this.GetPdfAttachment = function (base64Data) {
    return new Attachment("application/pdf", undefined, base64Data);
  };

  this.GetHumanName = function (use, text, famly, given, prefix, suffix, oPeriod) {
    return new HumanName(use, text, famly, given, prefix, suffix, oPeriod);
  };

  this.GetAddress = function (use, type, text, line, city, district, state, postalCode, country, oPeriod) {
    return new Address(use, type, text, line, city, district, state, postalCode, country, oPeriod);
  };

  this.GetAddressAustrlian = function (use, text, line, suburb, state, postalCode, country, oPeriod) {
    return new Address(use, undefined, text, line, suburb, undefined, state, postalCode, country, oPeriod);
  };

  this.GetNarrative = function (status, div) {
    return new Narrative(status, div);
  };

  this.GetExtension = function (url, valueXname, valueXvalue) {
    return new Extension(url, valueXname, valueXvalue);
  };

  this.GetQuantity = function (value, comparator, unit, system, code) {
    return new Quantity(value, comparator, unit, system, code);
  };

  this.GetContactPoint = function (systemCode, valueString, useCode, rankPositiveInt, oPeriod) {
    return new ContactPoint(systemCode, valueString, useCode, rankPositiveInt, oPeriod);
  };

  function ContactPoint(systemCode, valueString, useCode, rankPositiveInt, oPeriod) {
    var ContactPoint = new function () { };
    ContactPoint.system = oFhirTool.SetFhir(systemCode);
    ContactPoint.value = oFhirTool.SetFhir(valueString);
    ContactPoint.use = oFhirTool.SetFhir(useCode);
    ContactPoint.rank = oFhirTool.SetFhir(rankPositiveInt);
    ContactPoint.period = oFhirTool.SetFhir(oPeriod);
    return ContactPoint;
  }

  function Quantity(value, comparator, unit, system, code) {
    var Quantity = new function () { };
    Quantity.value = QuantityValue(value);
    Quantity.comparator = oFhirTool.SetFhir(comparator);
    Quantity.unit = oFhirTool.SetFhir(unit);
    Quantity.system = oFhirTool.SetFhir(system);
    Quantity.code = oFhirTool.SetFhir(code);
    return Quantity;
  }

  function QuantityValue(value) {
    var QuantityValue = new function () { };
    //QuantityValue.StringQuantityValue = value
    QuantityValue.toJSON = function (key) {
      //  BreakPoint;
      return "##*##" + value;
    };
    return QuantityValue;
  }

  function Extension(url, valueXname, valueXvalue) {
    var Extension = new function () { };
    Extension.url = oFhirTool.SetFhir(url);
    Extension[valueXname] = oFhirTool.SetFhir(valueXvalue);
    return Extension;
  }

  function Narrative(status, div) {
    var Narrative = new function () { };
    Narrative.status = oFhirTool.SetFhir(status);
    Narrative.div = oFhirTool.SetFhir(div);
    return Narrative;
  }

  function Coding(code, codeSystem, display, version) {
    var coding = new function () { };
    coding.code = oFhirTool.SetFhir(code);
    coding.system = oFhirTool.SetFhir(codeSystem);
    coding.display = oFhirTool.SetFhir(display);
    coding.version = oFhirTool.SetFhir(version);
    return coding;
  }

  function Reference(reference, typeUri, oIdentifer, display) {
    var ref = new function () { };
    ref.reference = oFhirTool.SetFhir(reference);
    ref.type = oFhirTool.SetFhir(typeUri);
    ref.identifier = oFhirTool.SetFhir(oIdentifer);
    ref.display = oFhirTool.SetFhir(display);
    return ref;
  }


  function Identifier(use, oType, system, value, oPeriod, oAssigner) {
    var id = new function () { };
    id.use = oFhirTool.SetFhir(use);
    id.type = oType;
    id.system = oFhirTool.SetFhir(system)
    id.value = oFhirTool.SetFhir(value)
    id.period = oPeriod
    id.assigner = oAssigner
    return id;
  }

  function CodeableConcept(oCoding, text) {
    var CodeableConcept = new function () { };
    CodeableConcept.coding = oCoding;
    CodeableConcept.text = oFhirTool.SetFhir(text);
    return CodeableConcept;
  }

  function Period(start, end) {
    var Period = new function () { };
    Period.start = oFhirTool.SetFhir(start);
    Period.end = oFhirTool.SetFhir(end);
    return Period;
  }

  function Attachment(contentType, language, data) {
    var Attachment = new function () { };
    Attachment.contentType = oFhirTool.SetFhir(contentType);
    Attachment.language = oFhirTool.SetFhir(language);
    Attachment.data = oFhirTool.SetFhir(data);
    return Attachment;
  }

  function HumanName(use, text, family, given, prefix, suffix, oPeriod) {
    var HumanName = new function () { };
    HumanName.use = oFhirTool.SetFhir(use);
    HumanName.text = oFhirTool.SetFhir(text);
    HumanName.family = oFhirTool.SetFhir(family);
    HumanName.given = oFhirTool.SetFhir(given);
    HumanName.prefix = oFhirTool.SetFhir(prefix);
    HumanName.suffix = oFhirTool.SetFhir(suffix);
    HumanName.period = oPeriod;
    return HumanName;
  }

  function Address(use, type, text, line, city, district, state, postalCode, country, oPeriod) {
    var Address = new function () { };
    Address.use = oFhirTool.SetFhir(use);
    Address.type = oFhirTool.SetFhir(type);
    //Resolve a formatted Address is one is not supplied in the text property
    if (text != undefined || text != null) {
      Address.text = oFhirTool.SetFhir(text);
    } else {
      if ((line != undefined || line != null) && (line.length == 1)) {
        Address.text = oFhirTool.FormattedAddress(line[0], null, city, postalCode, state);
      } else if ((line != undefined || line != null) && (line.length >= 2)) {
        Address.text = oFhirTool.FormattedAddress(line[0], line[1], city, postalCode, state);
      }
    }
    Address.line = oFhirTool.SetFhir(line);
    Address.city = oFhirTool.SetFhir(city);
    Address.district = oFhirTool.SetFhir(district);
    Address.state = oFhirTool.SetFhir(state);
    Address.postalCode = oFhirTool.SetFhir(postalCode);
    Address.country = oFhirTool.SetFhir(country);
    Address.period = oPeriod;
    return Address;
  }

  function Meta(versionId, lastUpdatedInstant, profileUriArray, oSecurityCodingArray, oTagCodingArray) {
    var Meta = new function () { };
    Meta.versionId = oFhirTool.SetFhir(versionId);
    Meta.lastUpdated = oFhirTool.SetFhir(lastUpdatedInstant);
    Meta.profile = oFhirTool.SetFhir(profileUriArray);
    Meta.security = oSecurityCodingArray;
    Meta.tag = oTagCodingArray;
    return Meta;
  }



}